import { useEffect, useState, useRef, useContext } from "react";
import { useAuth, socket} from "../../context/AuthContext";
import './style.css';

function ChatRoom() {
  const { user } = useAuth();
  const  token = localStorage.getItem('token');

  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/negotiations/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 404) return null; // no active negotiation
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setNegotiation(data))
      .catch(() => setError("Failed to load negotiation."))
      .finally(() => setLoading(false));
  }, []);

  // socket: listen for new messages 
  useEffect(() => {
    socket.on("negotiation:message", (data) => {
      if (data.negotiation_id === negotiation?.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("negotiation:error", (data) => setError(data.message));

    return () => {
      socket.off("negotiation:message");
      socket.off("negotiation:error");
    };
  }, [negotiation]);

  //countdown timer
  useEffect(() => {
    if (!negotiation?.expiresAt) return;

    const interval = setInterval(() => {
      const diff = new Date(negotiation.expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setNegotiation((prev) => ({ ...prev, status: "expired" }));
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [negotiation?.expiresAt]);

  //auto-scroll to latest message 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send message 
  const sendMessage = () => {
    if (!input.trim() || !negotiation) return;
    socket.emit("negotiation:message", {
      negotiation_id: negotiation.id,
      text: input,
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // decision : accept / decline
  const makeDecision = (decision) => {
    setError(null);
    fetch("/negotiations/me/decision", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision, negotiation_id: negotiation.id }),
    })
      .then((r) => {
        if (r.status === 409) throw new Error("This negotiation is no longer active or has a conflict.");
        if (!r.ok) throw new Error("Failed to submit decision.");
        return r.json();
      })
      .then((updated) => {
        // update local negotiation with new decisions + status
        setNegotiation((prev) => ({
          ...prev,
          status: updated.status,
          decisions: updated.decisions,
        }));
      })
      .catch((e) => setError(e.message));
  };

  // derived values
  const isActive = negotiation?.status === "active";
  const isRegularUser = user?.role === "regular"; 

  const myDecision     = isRegularUser ? negotiation?.decisions?.candidate : negotiation?.decisions?.business;
  const theirDecision  = isRegularUser ? negotiation?.decisions?.business  : negotiation?.decisions?.candidate;

  const otherPartyName = isRegularUser
    ? negotiation?.job?.business?.business_name
    : `${negotiation?.user?.first_name} ${negotiation?.user?.last_name}`;

  const alreadyDecided = myDecision !== null;

  //render 
  if (loading) return <div className="chatContainer"><p>Loading...</p></div>;

  return (
    <div className="chatContainer">
      <div className="chatRoomTitle">
        <h2>Chat Room</h2>
      </div>

      {error && <div className="error">{error}</div>}

      {!negotiation ? (
        <div className="noNegotiation">
          <p>You have no active negotiation at the moment.</p>
        </div>
      ) : (<>
        <div className="negotiationHeader">
          <div className="headerLeft">
              <span>Negotiating with&nbsp; 
              {otherPartyName} for {negotiation.job.position_type.name}</span>
            </div>
            <div className="headerRight">
              {timeLeft && (
                <span className={`timer ${timeLeft === "Expired" ? "expired" : ""}`}>
                  ⏱ {timeLeft}
                </span>
              )}
              <span className={`statusBadge ${negotiation.status}`}>
                {negotiation.status}
              </span>
            </div>
          </div>
        {/*  Acceptance State*/}
        <div className="acceptanceState">
          <span>You: {myDecision ?? "Pending, "}</span>
          <span>Them: {theirDecision ?? " Pending"}</span>
        </div>

        <div className="messageContainer">
          {/*  Chat Log */}
          <div className="chatLog">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.sender.id === user.id ? "mine" : "theirs"}`}
              >
                <span className="msgText">{msg.text} </span>
                <span className="msgTime">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* ── Accept / Decline — only shown while active and no decision yet ── */}
          {isActive && (
            <div className="negotiationControls">
              <button
                className="acceptBtn"
                onClick={() => makeDecision("accept")}
                disabled={alreadyDecided}
              >
                {myDecision === "accept" ? " Accepted" : "Accept"}
              </button>
              <button
                className="rejectBtn"
                onClick={() => makeDecision("decline")}
                disabled={alreadyDecided}
              >
                {myDecision === "decline" ? " Declined" : "Decline"}
              </button>
            </div>
          )}

          {/* Expired / Ended banner*/}
          {!isActive && (
            <div className={`endedBanner ${negotiation.status}`}>
              {negotiation.status === "success"  && "Negotiation successful! The job has been filled."}
              {negotiation.status === "failed"   && "Negotiation failed."}
              {negotiation.status === "expired"  && "This negotiation has expired."}
            </div>
          )}

          {/*  Input */}
          <div className="inputArea">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isActive ? "Type a message..." : "This negotiation is no longer active"}
              disabled={!isActive}
            />
            <button className="sendBtn" onClick={sendMessage} disabled={!isActive}>
              Send
            </button>
          </div>

        </div>
      </>)}
    </div>
  );
}

export default ChatRoom;
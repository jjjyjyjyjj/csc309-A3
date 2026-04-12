import { useState, useRef } from "react";
import "./photo.css";

export default function ProfilePhoto({ handleImageChange, initial = "" }) {
    const [preview, setPreview] = useState(initial);
    const [_file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChangeLocal = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
        const blobUrl = URL.createObjectURL(file);
        setFile(file);
        setPreview(blobUrl);
        if (handleImageChange) handleImageChange({ file: file, preview: blobUrl });
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
        setFile(null);
        setPreview("");
        if (handleImageChange) handleImageChange({ file: null, preview: "" });
    };

    return (
        <div className="profilePhotoInput">
            <div
                className="profilePhotoContainer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                aria-label="Upload avatar"
            >
                {preview ? (
                    <>
                        <img className="profilePhotoImage" src={preview} alt="Profile" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            aria-label="Remove avatar"
                            className="removeButton"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <span className="profilePhotoPlaceholder">Upload Avatar</span>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChangeLocal}
                    className="hiddenFileInput"
                />
            </div>
        </div>
    );
}
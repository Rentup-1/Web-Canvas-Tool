import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { TextInput } from "../../../ui/controlled-inputs/TextInput";
import { Button } from "../../../ui/Button";
import { addImageElement } from "@/features/canvas/canvasSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export default function QRCodePanel() {
  const [link, setLink] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);
  const dispatch = useDispatch();

  // ref to access the QR code canvas
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerateQrCode = () => {
    if (link && link.trim() !== "") {
      setShowQr(true);
    } else {
      setShowQr(false);
      toast.error("Please enter a valid URL");
    }
  };

  const handleQrClick = () => {
    if (qrRef.current) {
      const dataUrl = qrRef.current.toDataURL("image/png");
      dispatch(
        addImageElement({
          src: dataUrl,
          width: 200,
          height: 200,
        })
      );
      toast.success("QR Code added to canvas");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start">
      <TextInput
        label="URL"
        onChange={(val: string) => {
          setLink(val);
          setShowQr(false); // reset QR until user regenerates
        }}
      />
      <Button onClick={handleGenerateQrCode}>Create QR Code</Button>

      {showQr && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <QRCodeCanvas
            ref={qrRef}
            value={link}
            size={200}
            includeMargin={true}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={handleQrClick} // QR itself is the button
          />
          <p className="text-s text-[primary]">
            Click the QR to add it to canvas
          </p>
        </div>
      )}
    </div>
  );
}

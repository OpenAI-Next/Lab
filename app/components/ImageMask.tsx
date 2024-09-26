// app/components/ImageMask.tsx

import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Segmented, Slider, Spin } from "antd";
import { GatewayOutlined, HighlightOutlined, RedoOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";

type BrushType = "free" | "rectangle";

const ImageMaskModal = (props: {
  open: boolean;
  onClose: () => void;
  originalImageUrl: string;
  onFinished: (maskBase64: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskCtx, setMaskCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [tempCtx, setTempCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  // const [debugInfo, setDebugInfo] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [brushType, setBrushType] = useState<BrushType>("free");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (props.open) {
      // setDebugInfo(`Attempting to load image: ${props.originalImageUrl}`);
      setIsLoading(true);
      setImageLoadError(null);

      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        // setDebugInfo(prev => `${prev}\nImage loaded successfully. Size: ${img.width}x${img.height}`);
        setOriginalSize({ width: img.width, height: img.height });
        if (canvasRef.current && maskCanvasRef.current && tempCanvasRef.current && containerRef.current) {
          const canvas = canvasRef.current;
          const maskCanvas = maskCanvasRef.current;
          const tempCanvas = tempCanvasRef.current;
          const container = containerRef.current;
          const context = canvas.getContext("2d");
          const maskContext = maskCanvas.getContext("2d");
          const tempContext = tempCanvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          context?.drawImage(img, 0, 0);
          // setCtx(context);
          setMaskCtx(maskContext);
          setTempCtx(tempContext);

          // Calculate initial scale
          const scaleX = container.clientWidth / img.width;
          const scaleY = container.clientHeight / img.height;
          const initialScale = Math.min(scaleX, scaleY, 1);
          setScale(initialScale);
        }
        setIsLoading(false);
      };

      img.onerror = (e) => {
        // setDebugInfo(prev => `${prev}\nImage failed to load. Error: ${e}`);
        console.error(e);
        setImageLoadError("图片加载失败");
        setIsLoading(false);
      };

      if (props.originalImageUrl.startsWith("data:image")) {
        img.src = props.originalImageUrl;
      } else {
        img.src = `${props.originalImageUrl}?t=${new Date().getTime()}`;
      }
    }
  }, [props.open, props.originalImageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tempCtx) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    if (brushType === "rectangle") {
      setStartPoint({ x, y });
    } else {
      tempCtx.beginPath();
      tempCtx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    if (!tempCtx || !maskCtx || !isDrawing) return;
    setIsDrawing(false);
    if (brushType === "rectangle" && startPoint) {
      const { x, y } = startPoint;
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);
      const startX = Math.min(x, startPoint.x);
      const startY = Math.min(y, startPoint.y);
      tempCtx.fillRect(startX, startY, width, height);
    }
    maskCtx.drawImage(tempCanvasRef.current!, 0, 0);
    tempCtx.clearRect(0, 0, tempCanvasRef.current!.width, tempCanvasRef.current!.height);
    setStartPoint(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !tempCtx || !tempCanvasRef.current) return;

    const { x, y } = getCoordinates(e);

    tempCtx.lineWidth = 10 / scale;
    tempCtx.lineCap = "round";
    tempCtx.strokeStyle = "white";
    tempCtx.fillStyle = "white";

    if (brushType === "free") {
      tempCtx.lineTo(x, y);
      tempCtx.stroke();
    } else if (brushType === "rectangle" && startPoint) {
      tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      tempCtx.fillRect(startPoint.x, startPoint.y, width, height);
    }
  };

  const handleReset = () => {
    if (maskCtx && maskCanvasRef.current) {
      maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    }
    if (tempCtx && tempCanvasRef.current) {
      tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = maskCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const getMaskBase64 = () => {
    if (!maskCanvasRef.current) return "";
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 创建新的画布来生成最终的蒙版
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        // 填充黑色背景
        tempCtx.fillStyle = "black";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // 设置合成操作为 "source-over"
        tempCtx.globalCompositeOperation = "source-over";

        // 将原始的白色绘制内容直接绘制到黑色背景上
        tempCtx.drawImage(canvas, 0, 0);
      }

      return tempCanvas.toDataURL("image/png").split(",")[1];
    }
    return "";
  };

  const handleFinish = () => {
    const maskBase64 = getMaskBase64();
    props.onFinished(maskBase64);
    props.onClose();
  };

  const handleZoom = (newScale: number) => {
    setScale(newScale);
  };

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      footer={[
        <Button key="cancel" onClick={props.onClose}>
          取消
        </Button>,
        <Button key="finish" type="primary" onClick={handleFinish}>
          完成
        </Button>,
      ]}
      closeIcon={false}
      centered={true}
      destroyOnClose={true}
      width="70%"
      style={{ maxHeight: "80vh", overflow: "auto" }}
    >
      <div>
        {/*<p>请在图片上绘制需要重绘的区域</p>*/}
        <h3>Please draw the area to be redrawn on the image</h3>
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Segmented
            options={[
              // {label: '自由画笔', value: 'free', icon: <HighlightOutlined/>},
              // {label: '矩形工具', value: 'rectangle', icon: <GatewayOutlined/>}
              {
                label: "Free Brush",
                value: "free",
                icon: <HighlightOutlined />,
                disabled: isLoading,
              },
              {
                label: "Rectangle Tool",
                value: "rectangle",
                icon: <GatewayOutlined />,
                disabled: isLoading,
              },
            ]}
            value={brushType}
            onChange={(value) => setBrushType(value as BrushType)}
          />
          <Button icon={<RedoOutlined />} onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ZoomOutOutlined />
            <Slider
              style={{ width: 100, margin: "0 10px" }}
              min={0.1}
              max={2}
              step={0.1}
              value={scale}
              onChange={handleZoom}
              disabled={isLoading}
            />
            <ZoomInOutlined />
          </div>
        </div>
        <Spin spinning={isLoading}>
          <div
            ref={containerRef}
            style={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {imageLoadError ? (
              <p>{imageLoadError}</p>
            ) : (
              <div
                style={{
                  position: "relative",
                  overflow: "auto",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: `${originalSize.width * scale}px`,
                    height: `${originalSize.height * scale}px`,
                  }}
                />
                <canvas
                  ref={maskCanvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${originalSize.width * scale}px`,
                    height: `${originalSize.height * scale}px`,
                    opacity: 0.5,
                  }}
                />
                <canvas
                  ref={tempCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    cursor: "crosshair",
                    width: `${originalSize.width * scale}px`,
                    height: `${originalSize.height * scale}px`,
                    opacity: 0.5,
                  }}
                />
              </div>
            )}
          </div>
          {/*<pre style={{ marginTop: 10, fontSize: '12px', whiteSpace: 'pre-wrap' }}>*/}
          {/*    {debugInfo}*/}
          {/*</pre>*/}
        </Spin>
      </div>
    </Modal>
  );
};

export default ImageMaskModal;

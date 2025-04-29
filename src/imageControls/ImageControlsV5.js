import React, { useEffect, useRef, useState } from "react";
import { useOpenCv } from "opencv-react";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import { executePercentileClipping } from "./executePercentileClipping.ts";
import { executeHistogramStretching } from "./executeHistogramStretching.ts";
import { Histogram } from "./Histogram.tsx";

const getBrightnessContrast = (name, cv, alpha, beta) => {
  let src = cv.imread(name);

  cv.convertScaleAbs(src, src, alpha, beta);

  cv.imshow(name, src);

  src.delete();
};

const getGamma = (name, cv, gamma) => {
  let src = cv.imread(name);
  const data = src.data;

  const gammalut = [];

  for (let i = 0; i <= 255; i += 1) {
    gammalut.push(Math.pow(i / 255, gamma) * 255);
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = gammalut[data[i]];
    data[i + 1] = gammalut[data[i + 1]];
    data[i + 2] = gammalut[data[i + 2]];
  }

  cv.imshow(name, src);
  src.delete();
};

const getSharpening = (name, cv, sigma, sharpeningStrength) => {
  let src = cv.imread(name);
  const data = src.data;
  let ksize = new cv.Size(0, 0);
  let sharpenDst = new cv.Mat();

  cv.GaussianBlur(src, sharpenDst, ksize, sigma, sigma, cv.BORDER_DEFAULT);

  const blurreddata = sharpenDst.data;

  const sharpen = (originalImage, blurredImage) => {
    const sharpenedData =
      originalImage + sharpeningStrength * (originalImage - blurredImage);
    if (sharpenedData < 0) {
      return 0;
    }
    if (sharpenedData > 255) {
      return 255;
    }
    return sharpenedData;
  };

  for (let i = 0; i < data.length; i += 4) {
    data[i] = sharpen(data[i], blurreddata[i]);
    data[i + 1] = sharpen(data[i + 1], blurreddata[i + 1]);
    data[i + 2] = sharpen(data[i + 2], blurreddata[i + 2]);
  }
  cv.imshow(name, src);
  src.delete();
  sharpenDst.delete();
};

export const ImageControlsV5 = ({ image, name }) => {
  const { cv } = useOpenCv();
  const canvasRef = useRef();
  const img = new Image();

  const [gamma, setGamma] = useState(1);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [blur, setBlur] = useState(1);
  const [sharpeningStrength, setSharpeningStrength] = useState(1);
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(100);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [clippedImageData, setClippedImageData] = useState(null);
  const [stretchedImageData, setStretchedImageData] = useState(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [visibleHistograms, setVisibleHistograms] = useState({
    original: true,
    clipped: true,
    stretched: true,
  });

  const drawOriginalImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    img.src = image;
    img.onload = () => {
      context.drawImage(img, 0, 0, 750, 750);
      // Store original image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalImageData(imageData.data);
      setClippedImageData(imageData.data);
      setStretchedImageData(imageData.data);
    };
  };

  const handleUpdateImage = ({
    lowerBound: newLowerBound,
    upperBound: newUpperBound,
  }) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    img.src = image;
    img.onload = () => {
      context.drawImage(img, 0, 0, 750, 750);

      if (cv) {
        const canvas = document.getElementById(name);
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        getBrightnessContrast(name, cv, contrast, brightness);
        getGamma(name, cv, gamma);
        getSharpening(name, cv, blur, sharpeningStrength);
        setLowerBound(newLowerBound);
        setUpperBound(newUpperBound);
        const clippedData = executePercentileClipping(imageData.data, {
          lowerBound: newLowerBound,
          upperBound: newUpperBound,
        });
        const stretchedData = executeHistogramStretching(clippedData);
        setClippedImageData(clippedData);
        setStretchedImageData(stretchedData);

        imageData.data.set(stretchedData);
        ctx.putImageData(imageData, 0, 0);
      }
    };
  };

  const handleResetImage = () => {
    setGamma(1);
    setBrightness(0);
    setContrast(1);
    setBlur(1);
    setSharpeningStrength(1);
    setLowerBound(0);
    setUpperBound(100);
    setClippedImageData(originalImageData);
    setStretchedImageData(originalImageData);
    drawOriginalImage();
  };

  useEffect(() => {
    drawOriginalImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "3em",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "3em",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            width: "50%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Gamma:</label>
            <Slider
              min={0}
              max={10}
              step={0.01}
              value={gamma}
              onChange={(e) => {
                setGamma(e.target.value);
                handleUpdateImage({
                  lowerBound,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Brightness:</label>
            <Slider
              min={-100}
              max={100}
              value={brightness}
              onChange={(e) => {
                setBrightness(e.target.value);
                handleUpdateImage({
                  lowerBound,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Contrast:</label>
            <Slider
              min={0}
              max={2}
              value={contrast}
              step={0.01}
              onChange={(e) => {
                setContrast(e.target.value);
                handleUpdateImage({
                  lowerBound,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Sharpening Kernel Size:</label>
            <Slider
              min={1}
              max={20}
              value={blur}
              step={1}
              onChange={(e) => {
                setBlur(e.target.value);
                handleUpdateImage({
                  lowerBound,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Sharpen Strength:</label>
            <Slider
              min={1}
              max={10}
              value={sharpeningStrength}
              step={0.01}
              onChange={(e) => {
                setSharpeningStrength(e.target.value);
                handleUpdateImage({
                  lowerBound,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Lower Bound (%):</label>
            <Slider
              min={0}
              max={5}
              value={lowerBound}
              step={0.1}
              onChange={(e) => {
                // setLowerBound(e.target.value);
                handleUpdateImage({
                  lowerBound: e.target.value,
                  upperBound,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em", width: "20em" }}>
            <label>Upper Bound (%):</label>
            <Slider
              min={95}
              max={100}
              value={upperBound}
              step={0.1}
              onChange={(e) => {
                handleUpdateImage({
                  lowerBound,
                  upperBound: e.target.value,
                });
              }}
              valueLabelDisplay="auto"
            />
          </div>
          <div style={{ display: "flex", gap: "1em" }}>
            <Button variant="outlined" onClick={handleResetImage}>
              Reset Image
            </Button>
          </div>
          <label>
            <input
              type="checkbox"
              checked={isDevMode}
              onChange={() => setIsDevMode(!isDevMode)}
            />
            Dev Mode
          </label>
        </div>

        <canvas
          id={name}
          ref={canvasRef}
          width={"750"}
          height={"750"}
          style={{ aspectRatio: 1, width: 500 }}
        />
      </div>

      {isDevMode && (
        <>
          {originalImageData && (
            <div style={{ width: "100%" }}>
              <Histogram
                imageData={
                  visibleHistograms.stretched ? stretchedImageData : undefined
                }
                title="Image Processing Pipeline"
                originalImageData={
                  visibleHistograms.original ? originalImageData : undefined
                }
                clippedImageData={
                  visibleHistograms.clipped ? clippedImageData : undefined
                }
              />
            </div>
          )}
          <div style={{ display: "flex", gap: "1em" }}>
            <label>
              <input
                type="checkbox"
                checked={visibleHistograms.original}
                onChange={() =>
                  setVisibleHistograms({
                    ...visibleHistograms,
                    original: !visibleHistograms.original,
                  })
                }
              />
              Original
            </label>
            <label>
              <input
                type="checkbox"
                checked={visibleHistograms.clipped}
                onChange={() =>
                  setVisibleHistograms({
                    ...visibleHistograms,
                    clipped: !visibleHistograms.clipped,
                  })
                }
              />
              Clipped
            </label>
            <label>
              <input
                type="checkbox"
                checked={visibleHistograms.stretched}
                onChange={() =>
                  setVisibleHistograms({
                    ...visibleHistograms,
                    stretched: !visibleHistograms.stretched,
                  })
                }
              />
              Stretched
            </label>
          </div>
        </>
      )}
    </div>
  );
};

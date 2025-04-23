import React, { useEffect, useRef, useState } from "react";
import { useOpenCv } from "opencv-react";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import { quantile } from "d3-array";
import { executePercentileClipping } from "./executePercentileClipping.ts";
import { Histogram } from "./Histogram.tsx";

// My attempt at histogram scaling (incomplete)
/*const createHistogram = (data, numBins, min, max) => {
    const histogram = [];
    const binSize = (max - min) / numBins;

    for (let i = 0; i < numBins; i += 1) {
        histogram.push([]);
    }

    for (let i = 0; i < data.length; i += 1) {
        if (data[i] < min || data[i] > max || i % 4 === 0) {
            continue;
        }
        const binNumber = Math.floor((data[i] - min) / binSize);
        histogram[binNumber].push(data[i]);
    }

    return histogram;
}

const getHistogramBin = (histogram, ignoredHistogram) => {
    const histogramSum = histogram.reduce((sum, bin) => sum + bin.reduce((sum, pixel) => sum + pixel, 0), 0);
    const ignoredHistogramSum = histogramSum * ignoredHistogram;

    let cumulativeSum = 0;

    return histogram.findIndex(bin => {
        cumulativeSum += bin.reduce((sum, pixel) => sum + pixel, 0);
        return cumulativeSum >= ignoredHistogramSum;
    });
}

const histogramScaling = (name, cv, ignoredIntensity = 0.02, ignoredHistogram = 0.005) => {
    let src = cv.imread(name);
    const data = src.data;
    
    const maxBit = 255;
    const ignoreBelow = Math.round(maxBit * ignoredIntensity);
    const ignoreAbove = Math.round(maxBit - ignoreBelow);
    const histogram = createHistogram(data, ignoreAbove - ignoreBelow + 1, ignoreBelow, ignoreAbove);
    
    const lowerHistogramBin = getHistogramBin(histogram, ignoredHistogram);
    const upperHistogramBin = getHistogramBin(histogram, 1 - ignoredHistogram);

    const currentLowerIntensity = ignoreBelow + lowerHistogramBin;
    const currentUpperIntensity = ignoreBelow + upperHistogramBin;

    const targetLowerIntensity = 0;
    const targetUpperIntensity = maxBit;

    const scaleFactor = targetUpperIntensity / (currentUpperIntensity + (targetLowerIntensity - currentLowerIntensity));
    

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(Math.max(data[i] * scaleFactor, 0), maxBit);
        data[i + 1] = Math.min(Math.max(data[i + 1] * scaleFactor, 0), maxBit);
        data[i + 2] = Math.min(Math.max(data[i + 2] * scaleFactor, 0), maxBit);
    }

    cv.imshow(name, src);
    src.delete();
}*/

const histogramClipping = (data, clipLimit) => {
  const lowerClipLimit = quantile(
    data.filter((_, i) => i % 4 !== 0),
    clipLimit[0] * 0.01
  );
  const upperClipLimit = quantile(
    data.filter((_, i) => i % 4 !== 0),
    clipLimit[1] * 0.01
  );

  const clippedValue = (data) => {
    if (data < lowerClipLimit) {
      return lowerClipLimit;
    }
    if (data > upperClipLimit) {
      return upperClipLimit;
    }
    return data;
  };

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clippedValue(data[i]);
    data[i + 1] = clippedValue(data[i + 1]);
    data[i + 2] = clippedValue(data[i + 2]);
  }
};

const getPreProcessing = (name, cv) => {
  let src = cv.imread(name);
  const data = src.data;
  // histogramClipping(data, [0.01, 99.9]);
  cv.imshow(name, src);
  src.delete();
};

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

  const drawOriginalImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    img.src = image;
    img.onload = () => {
      context.drawImage(img, 0, 0, 750, 750);
      // Store original image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalImageData(imageData.data);
    };
  };

  useEffect(() => {
    drawOriginalImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { cv } = useOpenCv();

  const updateImage = ({
    lowerBound: newLowerBound,
    upperBound: newUpperBound,
  }) => {
    if (cv) {
      getPreProcessing(name, cv);
      getBrightnessContrast(name, cv, contrast, brightness);
      getGamma(name, cv, gamma);
      getSharpening(name, cv, blur, sharpeningStrength);

      // Apply percentile clipping
      const canvas = document.getElementById(name);
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setLowerBound(newLowerBound);
      setUpperBound(newUpperBound);
      console.log("updateImage", { newLowerBound, newUpperBound });
      const clippedData = executePercentileClipping(imageData.data, {
        lowerBound: newLowerBound,
        upperBound: newUpperBound,
      });
      imageData.data.set(clippedData);
      ctx.putImageData(imageData, 0, 0);
      setClippedImageData(clippedData);
    }
  };

  // TODO: Combine handleUpdateImage and updateImage
  const handleUpdateImage = (params) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    img.src = image;
    img.onload = () => {
      context.drawImage(img, 0, 0, 750, 750);
      updateImage(params);
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
    drawOriginalImage();
  };

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
                // TODO: updateImage is firing with old state values
                // setUpperBound(e.target.value);
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
        </div>

        <canvas
          id={name}
          ref={canvasRef}
          width={"750"}
          height={"750"}
          style={{ aspectRatio: 1, width: 500 }}
        />
      </div>

      {originalImageData && (
        <div style={{ width: "100%" }}>
          {/* <Histogram
            imageData={originalImageData}
            title="Original Image Histogram"
          /> */}
          <Histogram
            imageData={clippedImageData ?? originalImageData}
            title="Clipped Image Histogram"
          />
          <div>
            <p>Lower Bound: {lowerBound}</p>
            <p>Upper Bound: {upperBound}</p>
          </div>
        </div>
      )}
    </div>
  );
};

import { quantile } from "d3-array";

export const executePercentileClipping = (
  imageArray: Uint8ClampedArray,
  parameters: { lowerBound: number; upperBound: number }
): Uint8ClampedArray => {
  // Extract RGB channels (skip alpha channel) and normalize to 0-1 range
  const rgbChannels: number[] = [];
  for (let i = 0; i < imageArray.length; i += 4) {
    rgbChannels.push(imageArray[i] / 255); // R
    rgbChannels.push(imageArray[i + 1] / 255); // G
    rgbChannels.push(imageArray[i + 2] / 255); // B
  }

  // Calculate quantiles on normalized RGB channels
  const lowerQuantile = quantile(rgbChannels, parameters.lowerBound / 100);
  const upperQuantile = quantile(rgbChannels, parameters.upperBound / 100);

  // Create a new array to store the clipped values
  const clippedArray = new Uint8ClampedArray(imageArray.length);

  // Apply clipping to each channel while preserving alpha
  for (let i = 0; i < imageArray.length; i += 4) {
    // Normalize current pixel values
    const r = imageArray[i] / 255;
    const g = imageArray[i + 1] / 255;
    const b = imageArray[i + 2] / 255;

    // Apply clipping in normalized space
    clippedArray[i] = Math.round(
      Math.min(Math.max(r, lowerQuantile), upperQuantile) * 255
    ); // R
    if (i === 0) {
      console.log({
        r,
        lowerQuantile,
        upperQuantile,
        clippedArray: clippedArray[i],
      });
    }
    clippedArray[i + 1] = Math.round(
      Math.min(Math.max(g, lowerQuantile), upperQuantile) * 255
    ); // G
    clippedArray[i + 2] = Math.round(
      Math.min(Math.max(b, lowerQuantile), upperQuantile) * 255
    ); // B
    clippedArray[i + 3] = imageArray[i + 3]; // A
  }

  // Log first 5 pixels (20 values) for comparison
  const firstPixels = Array.from(imageArray.slice(0, 20));
  const firstPixelsNormalized = firstPixels.map((v, i) =>
    i % 4 === 3 ? 1 : v / 255
  );
  const firstPixelsClipped = Array.from(clippedArray.slice(0, 20));

  console.log({
    clippedArray: firstPixelsClipped,
    clippedArrayLength: clippedArray.length,
    imageArray: firstPixels,
    lowerBound: parameters.lowerBound,
    lowerQuantile,
    normalizedArray: firstPixelsNormalized,
    upperBound: parameters.upperBound,
    upperQuantile,
  });

  return clippedArray;
};

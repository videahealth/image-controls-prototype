import React, { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface HistogramProps {
  imageData?: Uint8ClampedArray;
  title?: string;
  originalImageData?: Uint8ClampedArray;
  clippedImageData?: Uint8ClampedArray;
}

export const Histogram = ({
  imageData,
  title = "Pixel Value Distribution",
  originalImageData,
  clippedImageData,
}: HistogramProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Helper function to extract RGB values from image data
    const extractRGBValues = (data: Uint8ClampedArray) => {
      const values: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        values.push(data[i]); // R
        values.push(data[i + 1]); // G
        values.push(data[i + 2]); // B
      }
      return values;
    };

    // Helper function to create normalized histogram bins
    const createNormalizedBins = (values: number[]) => {
      const bins = new Array(256).fill(0);
      values.forEach((value) => bins[value]++);
      const maxCount = Math.max(...bins);
      return bins.map((count) => count / maxCount);
    };

    // Process all three datasets
    const originalValues = originalImageData
      ? extractRGBValues(originalImageData)
      : [];
    const clippedValues = clippedImageData
      ? extractRGBValues(clippedImageData)
      : [];
    const stretchedValues = imageData ? extractRGBValues(imageData) : [];

    // Create normalized bins for each dataset
    const originalBins =
      originalValues.length > 0 ? createNormalizedBins(originalValues) : [];
    const clippedBins =
      clippedValues.length > 0 ? createNormalizedBins(clippedValues) : [];
    const stretchedBins =
      stretchedValues.length > 0 ? createNormalizedBins(stretchedValues) : [];

    // Chart configuration
    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: Array.from({ length: 256 }, (_, i) => i.toString()),
        datasets: [
          ...(originalValues.length > 0
            ? [
                {
                  label: "Original Distribution",
                  data: originalBins,
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
              ]
            : []),
          ...(clippedValues.length > 0
            ? [
                {
                  label: "Clipped Distribution",
                  data: clippedBins,
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ]
            : []),
          ...(stretchedValues.length > 0
            ? [
                {
                  label: "Stretched Distribution",
                  data: stretchedBins,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Pixel Value",
            },
            ticks: {
              maxTicksLimit: 10,
            },
          },
          y: {
            title: {
              display: true,
              text: "Normalized Frequency",
            },
            beginAtZero: true,
          },
        },
      },
    };

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, config);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [imageData, originalImageData, clippedImageData, title]);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

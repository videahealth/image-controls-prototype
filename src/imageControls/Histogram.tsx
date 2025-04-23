import React, { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface HistogramProps {
  imageData: Uint8ClampedArray;
  title?: string;
}

export const Histogram = ({
  imageData,
  title = "Pixel Value Distribution",
}: HistogramProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Extract RGB channels (skip alpha)
    const rgbValues: number[] = [];
    for (let i = 0; i < imageData.length; i += 4) {
      rgbValues.push(imageData[i]); // R
      rgbValues.push(imageData[i + 1]); // G
      rgbValues.push(imageData[i + 2]); // B
    }

    // Create histogram bins
    const bins = new Array(256).fill(0);
    rgbValues.forEach((value) => {
      bins[value]++;
    });

    // Normalize histogram
    const maxCount = Math.max(...bins);
    const normalizedBins = bins.map((count) => count / maxCount);

    // Chart configuration
    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: Array.from({ length: 256 }, (_, i) => i.toString()),
        datasets: [
          {
            label: "Pixel Value Frequency",
            data: normalizedBins,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
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
            display: false,
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
  }, [imageData, title]);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

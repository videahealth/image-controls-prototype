import React, { useEffect, useRef, useState} from 'react';
import { Jimp } from "jimp";


export const ImageControlsV3 = ({image, name}) => {
    const canvasRef = useRef();
    const [displayImage, setDisplayImage] = useState(undefined);
    const [preSharpenedData, setPreSharpenedData] = useState(undefined);

    const [gamma, setGamma] = useState(1);
    const [sharpeningStrength, setSharpeningStrength] = useState(1);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(0);

    const applyGamma = (jimpImage, gamma) => {
        const data = jimpImage.bitmap.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.pow(data[i] / 255, gamma) * 255;
            data[i + 1] = Math.pow(data[i + 1] / 255, gamma) * 255;
            data[i + 2] = Math.pow(data[i + 2] / 255, gamma) * 255;
        }
    }

    const applySharpening = (jimpImage, sharpeningStrength, sigma) => {
        setPreSharpenedData(jimpImage.bitmap.data);

        jimpImage.convolute(
            [
                [0.00390625, 0.015625, 0.0234375, 0.015625, 0.00390625], 
                [0.015625, 0.0625, 0.09375, 0.0625, 0.015625],
                [0.0234375, 0.09375, 0.140625, 0.09375, 0.0234375],
                [0.015625, 0.0625, 0.09375, 0.0625, 0.015625],
                [0.00390625, 0.015625, 0.0234375, 0.015625, 0.00390625],
            ]
        );
        
        const data = jimpImage.bitmap.data;

        if (preSharpenedData) {
            for (let i = 0; i < data.length; i += 4) {
                data[i] = preSharpenedData[i] + sharpeningStrength * (preSharpenedData[i] - data[i]);
                data[i + 1] = preSharpenedData[i + 1] + sharpeningStrength * (preSharpenedData[i + 1] - data[i + 1]);
                data[i + 2] = preSharpenedData[i + 2] + sharpeningStrength * (preSharpenedData[i + 2] - data[i + 2]);
            }
        }
    }

    useEffect(() => {
    const loadImage = async () => {
      if (
        isNaN(Number(brightness)) || 
        isNaN(Number(contrast)) || 
        isNaN(Number(gamma)) ||
        isNaN(Number(sharpeningStrength))
      ) {
        return;
      }
      const jimpImage = await Jimp.read(image, { mime: Jimp.MIME_PNG });
      jimpImage.brightness(1);
      jimpImage.contrast(0);
      applyGamma(jimpImage, 5);
      applySharpening(jimpImage, 2.2, 3);
    
      const imageToDisplay = await jimpImage.getBase64("image/png")
      setDisplayImage(imageToDisplay);
    }

    loadImage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamma, sharpeningStrength, brightness, contrast]);

    useEffect(() => {
        if (displayImage) {
            const canvas = canvasRef.current
            const context = canvas.getContext('2d');
            const img = new Image();
            img.src = displayImage;
            img.onload = () => {
                context.drawImage(img, 0, 0, 1000, 1000);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayImage]);


    return (
        <div 
            style= 
                {{
                    "display": "flex", 
                    "flexDirection": "column", 
                    "gap": "1em",
                    "width": "50%",
                    "justifyContent": "center",
                    "alignItems": "center"
                }}
        >
            <h>{name}: Image Controls Using Jimp </h>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Gamma:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={gamma} 
                    onChange={(e) => setGamma(e.target.value)} 
                />
            </div>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Sharpening Strength:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={sharpeningStrength} 
                    onChange={(e) => setSharpeningStrength(e.target.value)} 
                />
            </div>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Brightness:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={brightness} 
                    onChange={(e) => setBrightness(e.target.value)} 
                />
            </div>
            <div style={{"display":"flex", "gap":"1em"}}>
                <label>
                    Contrast:
                </label>
                <input 
                    style = {{width: "5em"}}
                    type="text" 
                    value={contrast} 
                    onChange={(e) => setContrast(e.target.value)} 
                />
            </div>
            <canvas ref={canvasRef} width={"1000"} height={"1000"}/>
        </div>
    )
}
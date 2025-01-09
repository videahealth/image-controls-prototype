import React, { useEffect, useRef, useState} from 'react';
import { useOpenCv } from 'opencv-react';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';


const getBrightnessContrast = (name, cv, alpha, beta) => {
    let src = cv.imread(name);

    cv.convertScaleAbs(src, src, alpha, beta)

    cv.imshow(name, src);

    src.delete();
};

const getGamma = (name, cv, gamma) => {
    let src = cv.imread(name);
    const data = src.data;

    const gammalut = [];

    for (let i = 0; i <= 255; i += 1) {
        gammalut.push(Math.pow(i / 255, gamma) * 255) 
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
        const sharpenedData = originalImage + sharpeningStrength * (originalImage - blurredImage);
        if (sharpenedData < 0) {
            return 0;
        }
        if (sharpenedData > 255) {
            return 255;
        }
        return sharpenedData;
    }

    for (let i = 0; i < data.length; i += 4) {
        data[i] = sharpen(data[i], blurreddata[i]);
        data[i + 1] = sharpen(data[i + 1], blurreddata[i + 1]);
        data[i + 2] = sharpen(data[i + 2], blurreddata[i + 2]);
    }
    cv.imshow(name, src);
    src.delete();
    sharpenDst.delete();
};


export const ImageControlsV5 = ({image, name}) => {
    const canvasRef = useRef();
    const img = new Image();
    const [gamma, setGamma] = useState(1);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(1);
    const [blur, setBlur] = useState(1);
    const [sharpeningStrength, setSharpeningStrength] = useState(1);

    const drawOriginalImage = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        img.src = image;
        img.onload = () => {
            context.drawImage(img, 0, 0, 750, 750);
        };
    }

    useEffect(() => {
        drawOriginalImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { cv } = useOpenCv();

    const updateImage = () => {
        if (cv) {
            getBrightnessContrast(name, cv, contrast, brightness);
            getGamma(name, cv, gamma)
            getSharpening(name, cv, blur, sharpeningStrength) 
        }
    }

    const handleUpdateImage = () => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d');
        img.src = image;
        img.onload = () => {
            context.drawImage(img, 0, 0, 750, 750);
            updateImage();
        };
    }

    const handleResetImage = () => {
        setGamma(1);
        setBrightness(0);
        setContrast(1);
        setBlur(1);
        setSharpeningStrength(1);
        drawOriginalImage();
    }


    return (
        <div 
            style= 
                {{
                    "display": "flex", 
                    "flexDirection": "row", 
                    "gap": "3em",
                    "justifyContent": "center",
                    "alignItems": "center"
                }}
        >

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
            <div style={{"display":"flex", "gap":"1em", "width": "20em"}}>
                <label>
                    Gamma:
                </label>
                <Slider
                    min={0}
                    max={10}
                    step={0.01}
                    value={gamma}
                    onChange=
                    {
                        (e) => {
                            setGamma(e.target.value);
                            handleUpdateImage();
                        }
                    }
                    valueLabelDisplay="auto"
                />
            </div>
            <div style={{"display":"flex", "gap":"1em", "width": "20em"}}>
                <label>
                    Brightness:
                </label>
                <Slider
                    min={-100}
                    max={100}
                    value={brightness}
                    onChange=
                    {
                        (e) => {
                            setBrightness(e.target.value);
                            handleUpdateImage();
                        }
                    }
                    valueLabelDisplay="auto"
                />
            </div>
            <div style={{"display":"flex", "gap":"1em", "width": "20em"}}>
                <label>
                    Contrast:
                </label>
                <Slider
                    min={0}
                    max={3}
                    value={contrast}
                    step={0.1}
                    onChange=
                    {
                        (e) => {
                            setContrast(e.target.value);
                            handleUpdateImage();
                        }
                    }
                    valueLabelDisplay="auto"
                />
            </div>
            <div style={{"display":"flex", "gap":"1em", "width": "20em"}}>
                <label>
                    Blur:
                </label>
                <Slider
                    min={1}
                    max={20}
                    value={blur}
                    step={1}
                    onChange=
                    {
                        (e) => {
                            setBlur(e.target.value);
                            handleUpdateImage();
                        }
                    }
                    valueLabelDisplay="auto"
                />
            </div>
            <div style={{"display":"flex", "gap":"1em", "width": "20em"}}>
                <label>
                    Sharpen Strength:
                </label>
                <Slider
                    min={1}
                    max={10}
                    value={sharpeningStrength}
                    step={0.01}
                    onChange=
                    {
                        (e) => {
                            setSharpeningStrength(e.target.value);
                            handleUpdateImage();
                        }
                    }
                    valueLabelDisplay="auto"
                />
            </div>
            <div style={{"display":"flex", "gap":"1em"}}>
                <Button variant="outlined" onClick={handleResetImage}>Reset Image</Button>
            </div>
            {/*
                <div style={{"display":"flex", "gap":"1em"}}>
                    <Button variant="outlined" onClick={handleUpdateImage}>Update Image</Button>
                </div>
            */}
            </div>
            
            <canvas id={name} ref={canvasRef} width={"750"} height={"750"}/>
        </div>
    )
}
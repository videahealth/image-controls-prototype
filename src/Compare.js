import r4g5 from './convertedImagesReactOpenCv/r4g5.png';
import r4g1 from './convertedImagesReactOpenCv/r4g1.png';
import r4g1_5 from './convertedImagesReactOpenCv/r4g1_5.png';
import r4g2_51 from './convertedImagesReactOpenCv/r4g2_51.png';
import r4s5ss3 from './convertedImagesReactOpenCv/r4s5ss3.png';
import r4s8ss2_24 from './convertedImagesReactOpenCv/r4ss8s2_24.png';
import r4s8ss2_99 from './convertedImagesReactOpenCv/r4ss8s2_99.png';
import r4s12ss2_7 from './convertedImagesReactOpenCv/r4ss12s2_7.png';
import r4s15s2_99 from './convertedImagesReactOpenCv/r4ss15s2_99.png';
import r4_sharpening_sigma_5_strength_3 from './convertedImages/r4_sharpening_sigma_5_strength_3_original.png';
import r4_sharpening_sigma_8_strength_2_24 from './convertedImages/r4_sharpening_sigma_8_strength_2.24_original.png';
import r4_sharpening_sigma_8_strength_2_99 from './convertedImages/r4_sharpening_sigma_8_strength_2.99_original.png';
import r4_sharpening_sigma_12_strength_2_7 from './convertedImages/r4_sharpening_sigma_12_strength_2.7_original.png';
import r4_sharpening_sigma_15_strength_2_99 from './convertedImages/r4_sharpening_sigma_15_strength_2.99_original.png';
import r4_gamma_5 from './convertedImages/r4_gamma_5_original.png';
import r4_gamma_1 from './convertedImages/r4_gamma_1_original.png';
import r4_gamma_1_5 from './convertedImages/r4_gamma_1.50_original.png';
import r4_gamma_2_51 from './convertedImages/r4_gamma_2.51_original.png';
import { DisplayOriginalImage } from './imageControls/DisplayOriginalImage';

export const Compare = () => {
    
    return (
        <div
            style=
            {{
            "display": "flex", 
            "flexDirection": "column", 
            "gap": "3em",
            "justifyContent": "center",
            "alignItems": "center"
            }}
        >
            <p> Comparing to ML Outputs </p>
            <h> GAMMA </h>
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
                <DisplayOriginalImage image={r4g1} name={"Open CV output Gamma 1"} />
                <DisplayOriginalImage image={r4_gamma_1} name={"ML output Gamma 1"} />
            </div>
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
                <DisplayOriginalImage image={r4g1_5} name={"Open CV output Gamma 1.5"} />
                <DisplayOriginalImage image={r4_gamma_1_5} name={"ML output Gamma 1.5"} />
            </div>
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
                <DisplayOriginalImage image={r4g2_51} name={"Open CV output Gamma 2.51"} />
                <DisplayOriginalImage image={r4_gamma_2_51} name={"ML output Gamma 2.51"} />
            </div>
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
                <DisplayOriginalImage image={r4g5} name={"Open CV output Gamma 5"} />
                <DisplayOriginalImage image={r4_gamma_5} name={"ML output Gamma 5"} />
            </div>
            <h> Sharpening </h>
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
                <DisplayOriginalImage image={r4s5ss3} name={"Open CV output Sharpening Sigma 5 Strength 3"} />
                <DisplayOriginalImage image={r4_sharpening_sigma_5_strength_3} name={"ML output Sharpening Sigma 5 Strength 3"} />
            </div>
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
                <DisplayOriginalImage image={r4s8ss2_24} name={"Open CV output Sharpening Sigma 8 Strength 2.24"} />
                <DisplayOriginalImage image={r4_sharpening_sigma_8_strength_2_24} name={"ML output Sharpening Sigma 8 Strength 2.24"} />
            </div>
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
                <DisplayOriginalImage image={r4s8ss2_99} name={"Open CV output Sharpening Sigma 8 Strength 2.99"} />
                <DisplayOriginalImage image={r4_sharpening_sigma_8_strength_2_99} name={"ML output Sharpening Sigma 8 Strength 2.99"} />
            </div>
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
                <DisplayOriginalImage image={r4s12ss2_7} name={"Open CV output Sharpening Sigma 12 Strength 2.7"} />
                <DisplayOriginalImage image={r4_sharpening_sigma_12_strength_2_7} name={"ML output Sharpening Sigma 12 Strength 2.7"} />
            </div>
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
                <DisplayOriginalImage image={r4s15s2_99} name={"Open CV output Sharpening Sigma 15 Strength 2.99"} />
                <DisplayOriginalImage image={r4_sharpening_sigma_15_strength_2_99} name={"ML output Sharpening Sigma 15 Strength 2.99"} />
            </div>
        </div>
    )

}
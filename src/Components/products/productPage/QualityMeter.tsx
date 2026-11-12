import { clampScore, qualityTier } from "../../../data/quality";
import "./qualityMeter.css";

interface QualityMeterProps {
  quality: number; // 0 to 100, from a real inspection
}

function QualityMeter({ quality }: QualityMeterProps) {
  const score = clampScore(quality);
  const tier = qualityTier(score);

  return (
    <div
      className="quality-meter"
      role="meter"
      aria-label="Quality score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
    >
      <span className="quality-meter__label">Quality score</span>
      <span className="quality-meter__track">
        <span
          className={`quality-meter__fill quality-meter__fill--${tier}`}
          style={{ transform: `scaleX(${score / 100})` }}
        />
      </span>
      <span className={`quality-meter__value quality-meter__value--${tier}`}>
        {score}%
      </span>
    </div>
  );
}

export default QualityMeter;

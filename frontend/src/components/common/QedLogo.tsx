import { type FC, type HTMLAttributes } from "react";

type LogoSize = "sm" | "md" | "lg";

interface QedMarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: LogoSize;
  surfaceClassName?: string;
}

const MARK_PX: Record<LogoSize, number> = { sm: 28, md: 40, lg: 64 };

export const QedMark: FC<QedMarkProps> = ({
  size = "md",
  surfaceClassName = "border-white",
  className = "",
  style,
  ...rest
}) => {
  const px = MARK_PX[size];
  const ringBorder = Math.max(3, Math.round(px * 0.12));
  const square = Math.round(px * 0.4);
  const squareBorder = Math.max(2, Math.round(px * 0.06));

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: px, height: px, ...style }}
      aria-hidden="true"
      {...rest}
    >
      <span
        className="absolute inset-0 rounded-full border-[#2F62E0]"
        style={{ borderWidth: ringBorder }}
      />
      <span
        className={`absolute bg-[#16243F] ${surfaceClassName}`}
        style={{
          width: square,
          height: square,
          right: -squareBorder,
          bottom: -squareBorder,
          borderWidth: squareBorder,
          borderStyle: "solid",
        }}
      />
    </span>
  );
};

/** Dark-mode variant: lighter blue ring, white square punched into dark bg. */
export const QedMarkDark: FC<Omit<QedMarkProps, 'surfaceClassName'> & { bgColor?: string }> = ({
  size = "md",
  bgColor = "#0d1520",
  className = "",
  style,
  ...rest
}) => {
  const px = MARK_PX[size];
  const ringBorder = Math.max(3, Math.round(px * 0.12));
  const square = Math.round(px * 0.4);
  const squareBorder = Math.max(2, Math.round(px * 0.06));

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: px, height: px, ...style }}
      aria-hidden="true"
      {...rest}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ borderWidth: ringBorder, borderStyle: "solid", borderColor: "#6F9BFF" }}
      />
      <span
        style={{
          position: "absolute",
          width: square,
          height: square,
          right: -squareBorder,
          bottom: -squareBorder,
          borderWidth: squareBorder,
          borderStyle: "solid",
          borderColor: bgColor,
          background: "#ffffff",
        }}
      />
    </span>
  );
};

interface QedLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: LogoSize;
  iconOnly?: boolean;
  surfaceClassName?: string;
}

const WORDMARK_PX: Record<LogoSize, number> = { sm: 22, md: 32, lg: 52 };

export const QedLogo: FC<QedLogoProps> = ({
  size = "md",
  iconOnly = false,
  surfaceClassName,
  className = "",
  ...rest
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label="Q.E.D"
      {...rest}
    >
      <QedMark size={size} surfaceClassName={surfaceClassName} />
      {!iconOnly && (
        <span
          className="font-semibold leading-none tracking-tight text-[#16243F]"
          style={{ fontSize: WORDMARK_PX[size] }}
        >
          Q.E.D
        </span>
      )}
    </div>
  );
};

export const QedAppTile: FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = "",
}) => {
  const ring = Math.max(3, Math.round(size * 0.08));
  const inner = Math.round(size * 0.5);
  const square = Math.round(size * 0.2);
  return (
    <div
      className={`flex items-center justify-center rounded-[22%] bg-gradient-to-br from-[#3B6EE6] to-[#234FC4] shadow-lg shadow-[#234FC4]/30 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Q.E.D"
    >
      <span className="relative inline-block" style={{ width: inner, height: inner }}>
        <span
          className="absolute inset-0 rounded-full border-white"
          style={{ borderWidth: ring }}
        />
        <span
          className="absolute bg-white border-[#2A55C7] border-solid"
          style={{
            width: square,
            height: square,
            right: -ring,
            bottom: -ring,
            borderWidth: Math.max(2, Math.round(size * 0.045)),
          }}
        />
      </span>
    </div>
  );
};

export default QedLogo;

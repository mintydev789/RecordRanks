"use client";

import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const tooltipWidth = 200;
const horizontalPadding = 10;
const tipOffset = 20;
const tooltipOffset = tipOffset + 12;

type Props = {
  id: string;
  text: string;
};

function Tooltip({ id, text }: Props) {
  const [isBelowTarget, setIsBelowTarget] = useState(true);

  useEffect(() => {
    repositionTooltip();

    window.addEventListener("resize", repositionTooltip);
    window.addEventListener("scrollend", repositionTooltip);

    return () => {
      window.removeEventListener("resize", repositionTooltip);
      window.removeEventListener("scrollend", repositionTooltip);
    };
  }, []);

  // Limits the tooltip's horizontal position so that it doesn't go beyond the edge of the screen
  const repositionTooltip = () => {
    const tooltipDiv = document.getElementById(id);

    if (!tooltipDiv?.parentElement) {
      console.error(`Unable to find the parent of element with id ${id}`);
      return;
    }

    // The parent has no width, so it's a good reference point to do the calculations off of
    const parentBounds = tooltipDiv.parentElement.getBoundingClientRect();
    const optimalLeftEdge = parentBounds.left - tooltipWidth / 2 - horizontalPadding;
    const optimalRightEdge = parentBounds.right + tooltipWidth / 2 + horizontalPadding;
    let newPosition = -tooltipWidth / 2;

    if (optimalLeftEdge < 0) newPosition -= optimalLeftEdge;
    else if (optimalRightEdge > window.innerWidth) newPosition -= optimalRightEdge - window.innerWidth;

    tooltipDiv.style.left = `${newPosition}px`;

    updateIsBelowTarget(tooltipDiv);
  };

  const updateIsBelowTarget = (tooltipDiv: HTMLElement) => {
    const bounds = tooltipDiv.getBoundingClientRect();
    const globalPos = { top: bounds.top + window.scrollY, bottom: bounds.bottom + window.scrollY };
    const pageHeight = document.documentElement.getBoundingClientRect().height;
    setIsBelowTarget((prevIsBelowTarget: boolean) => {
      const positionSwitchDistance = bounds.height + tooltipOffset * 2;
      const distanceFromPageBottom = prevIsBelowTarget
        ? pageHeight - globalPos.bottom
        : pageHeight - globalPos.bottom - positionSwitchDistance;
      const distanceFromPageTop = prevIsBelowTarget ? globalPos.top - positionSwitchDistance : globalPos.top;

      return distanceFromPageBottom > distanceFromPageTop || distanceFromPageTop < 300;
    });
  };

  return (
    <div className="rr-tooltip position-relative d-flex align-items-center" style={{ cursor: "default" }}>
      <div
        className="rr-tooltip-text position-absolute d-flex flex-column align-items-center"
        style={{ height: 0, width: "100%" }}
      >
        {/* Tip of the tooltip pointing to the target */}
        <span
          className="position-absolute z-2 bg-black"
          style={{
            height: "1.5rem",
            width: "1.5rem",
            rotate: "45deg",
            ...(isBelowTarget ? { top: `${tipOffset}px` } : { bottom: `${tipOffset}px` }),
          }}
        />
        <div className="position-relative" style={{ width: "0" }}>
          {/* Tooltip */}
          <div
            id={id}
            className="position-absolute fs-6 z-3 rounded bg-black p-3 text-white"
            style={{
              width: `${tooltipWidth}px`,
              left: `${-tooltipWidth / 2}px`,
              ...(isBelowTarget ? { top: `${tooltipOffset}px` } : { bottom: `${tooltipOffset}px` }),
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
          </div>
        </div>
      </div>

      <FontAwesomeIcon icon={faQuestionCircle} className="fs-6 m-1 text-secondary-emphasis" />
    </div>
  );
}

export default Tooltip;

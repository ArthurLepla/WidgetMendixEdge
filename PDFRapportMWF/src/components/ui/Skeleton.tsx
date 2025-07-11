import React, { createElement } from "react";
import { SkeletonProps } from "../../types/widget";
import { palette } from "../../constants/config";

export const Skeleton: React.FC<SkeletonProps> = ({ 
    width = '100%', 
    height = '20px', 
    borderRadius = '4px',
    style = {}
}) => {
    return (
        <div
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: palette.gray[200],
                animation: 'pulse 2s ease-in-out infinite',
                ...style
            }}
        />
    );
}; 
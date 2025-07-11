import React, { createElement } from "react";
import { StatisticProps } from "../../types/widget";
import { palette } from "../../constants/config";

export const Statistic: React.FC<StatisticProps> = ({ 
    title, 
    value, 
    valueStyle = {}, 
    style = {} 
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: `1px solid ${palette.gray[200]}`,
            ...style
        }}>
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: palette.primary,
                marginBottom: '4px',
                ...valueStyle
            }}>
                {value}
            </div>
            <div style={{
                fontSize: '14px',
                color: palette.gray[600],
                fontWeight: '500'
            }}>
                {title}
            </div>
        </div>
    );
}; 
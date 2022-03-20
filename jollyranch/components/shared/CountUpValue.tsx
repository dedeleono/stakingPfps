import React, {FC} from "react";
import CountUp from "react-countup";

interface CountUpValueProps {
    value: number;
    prefix?: string;
    showCents?: boolean;
    decimals?: number;
    className?: string;
    props?: any;
}

const CountUpValue: FC<CountUpValueProps> = (
    {value,showCents = true,decimals =false,className,prefix = '', props}
) => {
    const _showCents = value !== 0 && showCents;
    return (
        <CountUp
            end={value}
            duration={0.5}
            separator=","
            decimals={decimals || (_showCents ? 2 : 0)}
            decimal="."
            prefix={prefix}
            preserveValue
            className={className}
            {...props}
        />
    );
}

export default CountUpValue;

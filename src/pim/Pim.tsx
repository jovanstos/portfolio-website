import { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import type { ApexOptions } from 'apexcharts';

/*
- Company News -1 - 1
- Global News -1 - 1
- Momentum Volume brought 70 > too much buying < 30 too little buying 0-100
- Moving Averages, distance between current price and average 
if average is 50 stock is 100, the stock is too high, current price - average
- Social Buzz 0 - 100. 100 many people talking 0 no one cares. If news bad and 100 tanks
if news good and 100 jumps
- Volatility Risk 0-100 Per Stock How much does it swing. 100 could go up 25% down 25% 0 1-3% changes
- P/E (Price-to-Earings) Ratio 0-100. 100 price is high earings low, 0 price cheap earings high
*/

// P.I.M. stands for predictive investment model
function PIM() {
    // Used for running the simulatoion as a dev since react when in strict mode reloads the component twice
    const devStartUp = useRef<boolean>(false);

    const [globalNews, setGlobalNews] = useState<number>(0);

    // High-growth tech: High price, moderate earnings = High P/E
    const stock1 = new Stock("NovaTech Robotics", 210.50, 450000000, 85, 75, 92);

    // Stable Utility: Lower price, consistent earnings = Low P/E
    const stock2 = new Stock("GreenGrid Energy", 45.20, 380000000, 30, 15, 20);

    // Volatile Biotech: High risk/volatility based on research news
    const stock3 = new Stock("BioPulse Pharma", 88.00, 120000000, 60, 90, 55);

    // Blue Chip Retail: Large earnings, very low volatility
    const stock4 =new Stock("TerraMart Global", 155.10, 1200000000, 45, 10, 12);

    // Penny Tech Startup: Low price and very low earnings, high buzz
    const stock5 =new Stock("CloudStream Inc.", 12.75, 250000000, 95, 80, 88);

    useEffect(() => {        
        if(!devStartUp.current){
            simulateNextWeek(stock1, globalNews);
            simulateNextWeek(stock2, globalNews);
            simulateNextWeek(stock3, globalNews);
            simulateNextWeek(stock4, globalNews);
            simulateNextWeek(stock5, globalNews);
            devStartUp.current = true;
        }
    }, [globalNews]);


    const seriesData: [number, number][] = [
        [new Date('2025-10-01').getTime(), 30],
        [new Date('2025-10-02').getTime(), 35],
        [new Date('2025-10-03').getTime(), 32],
        [new Date('2025-10-04').getTime(), 40],
        [new Date('2025-10-05').getTime(), 38],
        [new Date('2025-10-06').getTime(), 45],
        [new Date('2025-10-07').getTime(), 50]
    ];

    const options: ApexOptions = {
        chart: {
            id: 'apexchart-example'
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100]
            },
        },
        xaxis: {
            type: "datetime"
        },
        yaxis: {
            labels: {
                formatter: function (val: number) {
                    return val.toFixed(0);
                },
            },
            title: {
                text: 'Price'
            },
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val: number) {
                    return val.toFixed(0);
                }
            }
        }
    };

    const series = [{
        name: 'Investment Prediction',
        data: seriesData
    }];

    return (
        <Chart
            options={options}
            series={series}
            type="area"
            width={500}
            height={320}
        />
    );
}

export default PIM;
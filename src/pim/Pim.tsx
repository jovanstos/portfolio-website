import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import type { ApexOptions } from 'apexcharts';

/*
- Company News -1 - 1
- Global News -1 - 1
- Momentum Volume brought 70 > too much buying < 30 too little buying 0-100
- Social Buzz 0 - 100. 100 many people talking 0 no one cares. If news bad and 100 tanks
if news good and 100 jumps
- Volatility Risk 0-100 Per Stock How much does it swing. 100 could go up 25% down 25% 0 1-3% changes
- P/E (Price-to-Earings) Ratio 0-100. 100 price is high earings low, 0 price cheap earings high
*/

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

// P.I.M. stands for predictive investment model
function PIM() {
    // Used for running the simulatoion as a dev since react when in strict mode reloads the component twice
    const [seriesData, setSeriesData] = useState<[number | undefined, number][]>([[0, 0]]);
    const [globalNews, setGlobalNews] = useState<number>(0);
    const [week, setWeek] = useState<number>(0);

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

    function runSim(){
        simulateNextWeek(week, stock1, globalNews);
        
        setSeriesData(stock1.data);

        setWeek(prev => prev + 1); 
    }

    return (
        <main>
            <h1>Week {week}</h1>
            <Chart
                options={options}
                series={series}
                type="area"
                width={700}
                height={700}
            />
            <button onClick={runSim}>Run Sim</button>
        </main>
    );
}

export default PIM;
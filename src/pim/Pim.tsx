import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Stock } from "./Stock";
import type { ApexOptions } from 'apexcharts';
import { simulateNextWeek } from './stockAlgorithm';
import { generateNewsValue } from './NewsAlgorithm';
import { getTrainingData } from './LSTMDataGen';
import { Parser } from '@json2csv/plainjs';

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
    const [seriesData1, setSeriesData1] = useState<[number | undefined, number][]>([[0, 0]]);
    const [seriesData2, setSeriesData2] = useState<[number | undefined, number][]>([[0, 0]]);
    const [seriesData3, setSeriesData3] = useState<[number | undefined, number][]>([[0, 0]]);
    const [seriesData4, setSeriesData4] = useState<[number | undefined, number][]>([[0, 0]]);
    const [seriesData5, setSeriesData5] = useState<[number | undefined, number][]>([[0, 0]]);
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

    const series1 = [{
        name: 'Investment Prediction',
        data: seriesData1
    }];

     const series2 = [{
        name: 'Investment Prediction',
        data: seriesData2
    }];

    const series3 = [{
        name: 'Investment Prediction',
        data: seriesData3
    }];

    const series4 = [{
        name: 'Investment Prediction',
        data: seriesData4
    }];

    const series5 = [{
        name: 'Investment Prediction',
        data: seriesData5
    }];

    function downloadCSV() {
        const data = getTrainingData()
        
        try {
        const parser = new Parser();
        const csv = parser.parse(data);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LSTM_training_data.csv');
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        } catch (err) {
        console.error("CSV Export Error:", err);
        }
    };

    function runSim(){
        console.log(`-------------------WEEK: ${week}--------------------`);
        
        stock1.companyNews = generateNewsValue()
        stock2.companyNews = generateNewsValue()
        stock3.companyNews = generateNewsValue()
        stock4.companyNews = generateNewsValue()
        stock5.companyNews = generateNewsValue()

        const globalNewsChance = Math.random()

        if(globalNews !== 0 && globalNewsChance > 0.4){
            setGlobalNews(generateNewsValue());
        }else if(globalNewsChance > 0.75){
            setGlobalNews(generateNewsValue());
        }

        console.log("GLOBAL NEWS:", globalNews);
        
        console.log("COMAPNY NEWS 1:", stock1.companyNews);
        simulateNextWeek(week, stock1, globalNews);
        console.log("COMAPNY NEWS 2:", stock2.companyNews);
        simulateNextWeek(week, stock2, globalNews);
        console.log("COMAPNY NEWS 3:", stock3.companyNews);
        simulateNextWeek(week, stock3, globalNews);
        console.log("COMAPNY NEWS 4:", stock4.companyNews);
        simulateNextWeek(week, stock4, globalNews);
        console.log("COMAPNY NEWS 5:", stock5.companyNews);
        simulateNextWeek(week, stock5, globalNews);
        
        setSeriesData1(stock1.data);
        setSeriesData2(stock2.data);
        setSeriesData3(stock3.data);
        setSeriesData4(stock4.data);
        setSeriesData5(stock5.data);

        setWeek(prev => prev + 1); 
    }

    return (
        <main>
            <h1>Week {week}</h1>
            <div style={{display: "flex"}}>
                <Chart
                    options={options}
                    series={series1}
                    type="area"
                    width={500}
                    height={500}
                />
                <Chart
                    options={options}
                    series={series2}
                    type="area"
                    width={500}
                    height={500}
                />
                <Chart
                    options={options}
                    series={series3}
                    type="area"
                    width={500}
                    height={500}
                />
                <Chart
                    options={options}
                    series={series4}
                    type="area"
                    width={500}
                    height={500}
                />
                <Chart
                    options={options}
                    series={series5}
                    type="area"
                    width={500}
                    height={500}
                />
            </div>
            <button onClick={runSim}>Run Sim</button>
            <button
                onClick={downloadCSV}>
                Download CSV
            </button>
        </main>
    );
}

export default PIM;
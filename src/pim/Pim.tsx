import { useState } from 'react';
import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import { generateNewsValue } from './NewsAlgorithm';
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../api/python";
import { formatStockData } from './PIMDataUtils';
import StockComponent from './StockComponent';
import "../styles/PIM.css";
// Only used when deving
// import { Parser } from '@json2csv/plainjs';
// import { getTrainingData } from './PIMDataUtils';

// High-growth tech: High price, moderate earnings = High P/E
const stock1 = new Stock("NovaTech Robotics", 210.50, 450000000, 85, 75, 92);

// Stable Utility: Lower price, consistent earnings = Low P/E
const stock2 = new Stock("GreenGrid Energy", 45.20, 380000000, 30, 15, 20);

// Volatile Biotech: High risk/volatility based on research news
const stock3 = new Stock("BioPulse Pharma", 88.00, 120000000, 60, 90, 55);

// Blue Chip Retail: Large earnings, very low volatility
const stock4 = new Stock("TerraMart Global", 155.10, 1200000000, 45, 10, 12);

// Penny Tech Startup: Low price and very low earnings, high buzz
const stock5 = new Stock("CloudStream Inc.", 12.75, 250000000, 95, 80, 88);

// P.I.M. stands for predictive investment model
function PIM() {
    const [globalNews, setGlobalNews] = useState<number>(0);
    const [week, setWeek] = useState<number>(0);

    const PIMMutation = useMutation({
        mutationFn: postDataToPIM,
        onSuccess: async (data: number[]) => {
            console.log("DID IT", data[0]);
        },
        onError: (error: any) => {
            const msg = error instanceof Error ? error.message : "Unknown error occurred";
            console.error(msg);
        },
    });

    const handleRun = () => {
        PIMMutation.mutate(formatStockData(stock1, globalNews, week));
    };

    function runSim() {
        console.log(`-------------------WEEK: ${week}--------------------`);

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

        setWeek(prev => prev + 1);

        stock1.companyNews = generateNewsValue()
        stock2.companyNews = generateNewsValue()
        stock3.companyNews = generateNewsValue()
        stock4.companyNews = generateNewsValue()
        stock5.companyNews = generateNewsValue()

        const globalNewsChance = Math.random()

        if (globalNews !== 0 && globalNewsChance > 0.4) {
            setGlobalNews(generateNewsValue());
        } else if (globalNewsChance > 0.75) {
            setGlobalNews(generateNewsValue());
        }
    }

    // Only used when deving
    // function downloadCSV() {
    //     const data = getTrainingData()

    //     try {
    //         const parser = new Parser();
    //         const csv = parser.parse(data);

    //         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //         const url = URL.createObjectURL(blob);

    //         // Create a temporary link element to trigger download
    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.setAttribute('download', 'PIM_training_data.csv');
    //         document.body.appendChild(link);
    //         link.click();

    //         // Cleanup
    //         document.body.removeChild(link);
    //         URL.revokeObjectURL(url);
    //     } catch (err) {
    //         console.error("CSV Export Error:", err);
    //     }
    // };

    return (
        <main id='PIM'>
            <h1>Prediction Investment Model</h1>
            <h1>Week {week}</h1>
            <div style={{ display: "flex" }}>
                <StockComponent stock={stock1} color='#008FFB' globalNews={globalNews} week={week} />
                <StockComponent stock={stock2} color='#008FFB' globalNews={globalNews} week={week} />
                <StockComponent stock={stock3} color='#008FFB' globalNews={globalNews} week={week} />
                <StockComponent stock={stock4} color='#008FFB' globalNews={globalNews} week={week} />
                <StockComponent stock={stock5} color='#008FFB' globalNews={globalNews} week={week} />
            </div>
            <button onClick={runSim}>Run Sim</button>
            <button onClick={handleRun}>Call API</button>
        </main>
    );
}

export default PIM;
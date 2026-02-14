import type { StockComponentProps } from '../../types/pimTypes';
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../../api/python";
import StockChart from './StockChart';
import { formatStockData, handlePIMPrediction } from '../PIMDataUtils';
import "../../styles/PIM.css";

function StockComponent({
    stock,
    color,
    globalNews,
    week,
    width,
    height
}: StockComponentProps) {
    const PIMMutation = useMutation({
        mutationFn: postDataToPIM,
        onSuccess: async (data: number[]) => {
            handlePIMPrediction(data)
        },
        onError: (error: any) => {
            const msg = error instanceof Error ? error.message : "Unknown error occurred";
            console.error(msg);
        },
    });

    const askPIM = () => {
        PIMMutation.mutate(formatStockData(stock, globalNews, week));
    };

    return (
        <section className='stock'>
            <h3>{stock.companyName}</h3>
            <StockChart stock={stock} color={color} width={width} height={height} />
            <button onClick={askPIM}>Ask PIM</button>
        </section>
    );
}

export default StockComponent;
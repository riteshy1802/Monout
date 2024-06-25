import React,{ useContext,useState,useEffect } from "react";
import "../Analysis.css"
import '../Wallets.css';
import pizza from "../pizza.png"
import joystick from "../joystick.png"
import {motion} from "framer-motion"
import { AnimatePresence } from "framer-motion";
import AppContext from "../context/AppContext";
import { BarChart } from '@mui/x-charts';

export default function Analysis(){

    const {uid,setUid} = useContext(AppContext);

    const [displayCurrency,setDisplayCurrency] = useState('');


    useEffect(()=>{
        setUid(JSON.parse(localStorage.getItem("UID")))
        const storedCurrency = JSON.parse(localStorage.getItem("currencyType"));
        setDisplayCurrency(storedCurrency.label);
      },[]);

    function handleDetailsClick(){
        setShowDetails(prev=>!prev);
    }

    const transitionVariants = {
        hidden:{
            height:0,
            opacity:0
        },
        visible:{
            height:'60%',
            opacity:1,
            transition: {
                duration: 0.4
            }
        },
    }
    const dataset = [
        { london: 59, paris: 57, newYork: 86, seoul: 21, india: 28, month: 'Jan'},
        { london: 50, paris: 52, newYork: 78, seoul: 28, india: 68, month: 'Feb' },
        { london: 47, paris: 53, newYork: 106, seoul: 41, india: 88, month: 'Mar' },
        { london: 54, paris: 56, newYork: 92, seoul: 73, india: 129, month: 'Apr' },
        { london: 57, paris: 69, newYork: 92, seoul: 99, india: 23, month: 'May' },
        { london: 60, paris: 63, newYork: 103, seoul: 144, india: 54, month: 'Jun' },
        { london: 59, paris: 60, newYork: 105, seoul: 319, india: 32, month: 'Jul' },
        { london: 65, paris: 60, newYork: 106, seoul: 249, india: 57, month: 'Aug' },
        { london: 51, paris: 51, newYork: 95, seoul: 131, india: 76, month: 'Sep' },
        { london: 60, paris: 65, newYork: 97, seoul: 55, india: 50, month: 'Oct' },
        { london: 67, paris: 64, newYork: 76, seoul: 48, india: 90, month: 'Nov' },
        { london: 61, paris: 70, newYork: 103, seoul: 25, india: 400, month: 'Dec' }
    ];

    const {showDetails,setShowDetails} = useContext(AppContext)
    const valueFormatter = (value) => `${value} ${displayCurrency}`;
    return(
        <>
            <div className="pie--bar--chart">
                <div className="bar--chart--analysis--div">
                    <div className="bar--chart--title--div">
                        <p className="bar--chart--title">Analysis of Monthly Spend in Default Categories </p>
                    </div>
                    <BarChart
                        // margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                        dataset={dataset}
                        xAxis={[{ scaleType: 'band', dataKey:'month'}]}
                        series={[
                            { dataKey: 'london', label: 'Food', valueFormatter },
                            { dataKey: 'paris', label: 'Entertainment', valueFormatter },
                            { dataKey: 'newYork', label: 'Travel', valueFormatter },
                            { dataKey: 'seoul', label: 'Health and Fitness', valueFormatter },
                            { dataKey: 'india', label: 'Shopping', valueFormatter },
                          ]}
                        width={725}
                        height={400}
                        options={{
                        yAxis: {
                            tickSize: 0,
                            axisLineStyle: {
                            stroke: 'white',
                            },
                        },
                        }}
                    />
                </div>
                {/* <div className="pie--chart--title--div">
                    <p className="pie--chart--title"></p>
                </div> */}
                
            </div>
            <div className="analysis--parent--div">
                <div className="from--to--earnings--expense">
                    <p className="from--to">Dec 1 - Jan 7</p>
                    <div className="earnings--expense">
                        <div className="total--earnings--price">
                            <p className="total--earnings">Total Income</p>
                            <p className="price">640 USD</p>
                        </div>
                        <div className="total--expense--price">
                            <p className="total--earnings">Total Expense</p>
                            <p className="price">50USD</p>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {showDetails && 
                    (<motion.div variants={transitionVariants} initial="hidden" animate="visible">
                        <div className="horizontal--rule">
                        </div>
                        <div className="category--percentage--spent">
                            <div className="category">
                                <p className="category--title">Category</p>
                                <div className="category--items">
                                    <div className="category--item--element">
                                        <img draggable={false} src={pizza} className="pizza2"></img>
                                        <p className="category--name">Food</p>
                                    </div>
                                    <div className="category--item--element">
                                        <img draggable={false} src={joystick} className="pizza2"></img>
                                        <p className="category--name">Entertainment</p>
                                    </div>
                                </div>
                            </div>
                            <div className="percentage--spent">
                                <div className="percentage">
                                    <p className="percentage--title">Percentage</p>
                                    <div className="percentage--items">
                                        <p>50%</p>
                                        <p>50%</p>
                                    </div>
                                </div>
                                <div className="spent"> 
                                    <p className="spent--title">Spent</p>
                                    <div className="spent--items">
                                        <p>25 USD</p>
                                        <p>25 USD</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="transfers--received--sent">
                            <div className="transfers--received">
                                <p className="transfer--received--title">Transfers Received</p>
                                <p className="transfer--received--amt">0 USD</p>
                            </div>
                            <div className="transfers--sent">
                                <p className="transfer--received--title">Transfers Sent</p>
                                <p className="transfer--received--amt">40 USD</p>
                            </div>
                        </div>
                    </motion.div>)}
                </AnimatePresence>
                <button 
                onClick={()=>handleDetailsClick()} 
                type="button" 
                className="less--details"
                >
                    {showDetails ? "Less details" : "More details"}
                    {showDetails?<i class='bx bx-chevron-up' id="up--icon"></i>:<i class='bx bx-chevron-down' id="up--icon" ></i>}</button>
            </div>
        </>
    )
}
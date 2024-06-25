import React, { useContext, useEffect, useState } from "react";
import '../Wallets.css';
import AppContext from "../context/AppContext";
import { useParams } from "react-router-dom";
import { collection, onSnapshot, query, where,getDocs, deleteDoc } from "firebase/firestore";
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { db } from "../Firebase/firebase";
import emojiRegex from "emoji-regex";
import dayjs from "dayjs";

export default function TransactionHistory() {
    const {
        showAddTransactionModal,
        setShowAddTransactionModal,
        setShowExpense,
        setShowIncome,
        setShowTransfer,
        uid,
        setUid
    } = useContext(AppContext);

    const [transactionData, setTransactionData] = useState([]);
    const [displayCurrency, setDisplayCurrency] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [showLoader,setShowLoader] = useState(null);
    const [ID,setID] = useState(null);

    const { id } = useParams();

    useEffect(() => {
        const storedUid = JSON.parse(localStorage.getItem('UID'));
        if (storedUid) {
            setUid(storedUid);
        }

        const storedCurrency = JSON.parse(localStorage.getItem("currencyType"));
        if (storedCurrency) {
            setDisplayCurrency(storedCurrency.label);
        }
    }, []);

    useEffect(() => {
        if (uid && id) {
            const unsubscribeRegular = fetchRegularTransactions(uid, id);
            const unsubscribeTransfers = fetchTransferTransactions(uid, id);

            return () => {
                unsubscribeRegular();
                unsubscribeTransfers();
            };
        }
    }, [uid, id]);

    useEffect(() => {
        const combinedTransactions = [...transactions, ...transfers];
        const filteredTransactions = combinedTransactions.filter(transaction => {
            return transaction.wallet_id === id || transaction.wallet_id_from === id || transaction.wallet_id_to === id;
        });
        setTransactionData(groupTransactionsByDate(filteredTransactions));
    }, [transactions, transfers, id]);

    function fetchRegularTransactions(uid, id) {
        const q = query(collection(db, "transactions"), where("uid", '==', uid), where('wallet_id', '==', id));
        return onSnapshot(q, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map((doc) => {
                const item = doc.data();
                if (item.category) {
                    const regex = emojiRegex();
                    const match = item.category.match(regex);
                    let emoji = '';
                    let text = item.category;
                    if (match) {
                        emoji = match[0];
                        text = item.category.replace(emoji, '').trim();
                    }
                    return {
                        ...item,
                        emoji: emoji,
                        text: text
                    };
                }
                return item;
            });
            setTransactions(fetchedTransactions);
        });
    }

    function fetchTransferTransactions(uid, id) {
        const q = query(collection(db, 'transactions'), where('uid', '==', uid), where('typeOfTransaction', '==', 'transfer'));
        return onSnapshot(q, (snapshot) => {
            const fetchedTransfers = snapshot.docs.map((doc) => {
                const item = doc.data();
                return item.wallet_id_from === id || item.wallet_id_to === id ? item : null;
            }).filter(item => item !== null);
            setTransfers(fetchedTransfers);
        });
    }

    function groupTransactionsByDate(transactions) {
        const groupedTransactions = transactions.reduce((acc, transaction) => {
            const date = transaction.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(transaction);
            return acc;
        }, {});

        return Object.keys(groupedTransactions).map((date) => ({
            date: date,
            transactions: groupedTransactions[date]
        })).sort((a, b) => dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1);
    }

    const TransferGreenStyles = {
        fontSize: '1.3rem',
        fontFamily: 'Karla, sans-serif',
        fontWeight: '600',
        color: '#60E27F'
    };
    const TransferRedStyles = {
        fontSize: '1.3rem',
        fontFamily: 'Karla, sans-serif',
        fontWeight: '600',
        color: '#cf0e0e'
    };

    function OpenAddTransaction() {
        setShowAddTransactionModal(true);
        setShowExpense(true);
        setShowIncome(false);
        setShowTransfer(false);
    }

    async function handleDeleteTransaction(itemID) {
        try {
            setShowLoader(true); 
            setID(itemID); 
    
            const q = query(collection(db, 'transactions'), where('uid', '==', uid), where('id', '==', itemID));
            const docSnapshot = await getDocs(q);
    
            if (!docSnapshot.empty) {
                const item = docSnapshot.docs[0];
                await deleteDoc(item.ref);
                setShowLoader(false);
                setID(null); 
            }
        } catch (error) {
            console.log("Error occurred: ", error);
            setShowLoader(false);
            setID(null); 
        }
    }

    return (
        <>
            <div className='child--div--one'>
                <div className='wallet-type-history-analytics-settings'>
                </div>
                <div className='transaction--addbutton--div'>
                    <p className='transaction'>Transactions</p>
                    <button type="button" className='addbutton' onClick={OpenAddTransaction}>Add Transaction</button>
                </div>

                <div className='allTransactions'>
                    {transactionData.length > 0 ? (
                        transactionData.map((item) => (
                            <React.Fragment key={item.date}>
                                <p className='date'>{item.date}</p>
                                {item.transactions.map((element) => (
                                    <div className='allTransactions--child' key={element.id}>
                                        <div className='transactions--made'>
                                            {element.emoji && <p className="emoji--icon">{element.emoji}</p>}
                                            {element.imageURL && <img src={element.imageURL} alt='joystick' className='pizza' draggable={false} />}
                                            <div className='amount--name1'>
                                            {element.typeOfTransaction === 'transfer' ? (
                                                    <p className='amount' style={element.wallet_id_to === id ? TransferGreenStyles : TransferRedStyles}>
                                                        {element.wallet_id_to === id ? '+' : '-'} {Number(element.amount).toFixed(2)} {displayCurrency}
                                                    </p>
                                                ) : (
                                                    <p className='amount'>
                                                        {Number(element.amount).toFixed(2)} {displayCurrency}
                                                    </p>
                                                )}
                                                <p className='name1'>{element.description}</p>
                                            </div>
                                            {element.id===ID ?
                                            <div className="load">
                                                {<Stack sx={{ color: 'grey.500' }}>
                                                    <CircularProgress color="inherit" size={20} />
                                                </Stack>}   
                                            </div>
                                            : 
                                            <i className='bx bx-trash move--to--bin' id="three-dots"onClick={()=>handleDeleteTransaction(element.id)}></i>}
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))
                    ) : <div className="nothingFound--div">
                           <p className="nothingFound--text">No Transaction yet..</p> 
                        </div>}
                </div>
            </div>
        </>
    );
}

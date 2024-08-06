'use client'
import React, { useState, useEffect } from 'react';
import { addDoc, collection, updateDoc, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import { onSnapshot, query } from 'firebase/firestore';
import { deleteDoc, doc } from 'firebase/firestore';
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from 'axios';


interface Item {
  name: any;
  amount: any;
  id?: any;
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);

  const [newItem, setNewItem] = useState<Item>({ name: '', amount: '' });

  //add items to database
  const addItem = async (e: any) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.amount !== '') {
      const q = query(collection(db, 'expenses'), where('name'.toLowerCase(), '==', newItem.name.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If item exists, update the quantity
        const itemDoc = querySnapshot.docs[0];
        const currentAmount = itemDoc.data().amount;
        await updateDoc(doc(db, 'expenses', itemDoc.id), {
          amount: currentAmount + parseInt(newItem.amount),
        });
      } else {
        // If item does not exist, add new item
        await addDoc(collection(db, 'expenses'), {
          name: newItem.name.trim().toLowerCase(),
          amount: parseInt(newItem.amount),
        });
      }
      setNewItem({ name: '', amount: '' });
    }
  };

  //read items from database
  useEffect(() => {
    const q = query(collection(db, 'expenses'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr: any = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      return () => unsubscribe();
    });

  }, [])

  //delete items from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  }

  // Increment item quantity
  const incrementItem = async (id: string, currentAmount: number) => {
    const itemDoc = doc(db, 'expenses', id);
    await updateDoc(itemDoc, { amount: currentAmount + 1 });
  };

  // Decrement item quantity
  const decrementItem = async (id: string, currentAmount: number) => {
    if (currentAmount > 1) {
      const itemDoc = doc(db, 'expenses', id);
      await updateDoc(itemDoc, { amount: currentAmount - 1 });
    }
    else {
      deleteItem(id);
    }
  };

  const [itemLog, setItemLog] = useState<string>('');

  const createItemLog = () => {
    const log = items.map(item => `${item.name}: ${item.amount}`).join('\n');
    setItemLog(log);
    return log;
  };


  //start of recipe generator
  const [dish, setDish] = useState("");
  const [recipe, setRecipe] = useState("");

  async function generateAnswer() {

    const x = createItemLog();
    const question = "Give me something I can cook with these ingredients" + x + "dont say anything else but the dish"
    setDish('Loading...')
    const response = await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAjjU0onhCW7MMKHuvQ249WCGV1aqnboXc",
      method: "post",
      data: { contents: [{ parts: [{ text: question }] },], }
    })
    setDish(response['data']['candidates'][0]['content']['parts'][0]['text'])

    const newQuestion = "Give me instructions how to make " + dish + "only use these ingredients and only this/these ingredients" + x + " dont say anything other than the instructions"
    const newResponse = await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAjjU0onhCW7MMKHuvQ249WCGV1aqnboXc",
      method: "post",
      data: { contents: [{ parts: [{ text: newQuestion }] },], }
    })
    setRecipe(newResponse['data']['candidates'][0]['content']['parts'][0]['text'])

  }

  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-pink-50 min-h-screen">
      <header>
        <h1 className="text-4xl text-center text-white py-4 bg-pink-400">Pantry Tracker</h1>
        <h2 className="text-xl text-center text-gray-800 py-4 bg-gray-200">Please enter your pantry contents and generate a recipe if needed!</h2>
      </header>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center mt-10 space-y-4 md:space-y-0 md:space-x-4">
          <form className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full max-w-3xl">
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-3 border-2 border-gray-300 rounded-md flex-grow"
              type="text"
              required
              placeholder="Enter Item"
            />
            <input
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              className="p-3 border-2 border-gray-300 rounded-md w-24"
              type="number"
              min="1"
              placeholder="Qty"
            />
            <button
              onClick={addItem}
              className="text-white bg-pink-400 hover:bg-green-600 p-3 rounded-md transition duration-300 ease-in-out"
              type="submit"
            >
              Add Item
            </button>
          </form>
        </div>

        <div className="mt-8 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-md mb-4"
          />
          <ScrollArea className="h-[300px] rounded-md border border-black-300 bg-pink-100">
            <div className="p-4">
              <h3 className="mb-4 font-medium leading-none text-gray-800">
                <span className="ml-5">Item</span>
                <span className="float-right mr-24">Amount</span>
              </h3>
              {filteredItems.map((item, id) => (
                <div key={id} className="text-lg my-2 w-full flex justify-between items-center bg-white rounded-md">
                  <div className="p-4 w-full flex justify-between items-center">
                    <span className="capitalize">{item.name}</span>
                    <span>Quantity: {item.amount}</span>
                  </div>
                  <div className="flex">
                    <button onClick={() => decrementItem(item.id, item.amount)} className="p-2 text-pink-600 hover:bg-yellow-200 rounded-l-md">-</button>
                    <button onClick={() => incrementItem(item.id, item.amount)} className="p-2 text-pink-600 hover:bg-yellow-200">+</button>
                    <button onClick={() => deleteItem(item.id)} className="p-2 text-red-600 hover:bg-red-200 rounded-r-md">X</button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="bg-pink-100 rounded-md p-6 mt-10 max-w-3xl mx-auto border border-gray-300">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={generateAnswer}
              className="text-white bg-pink-400 hover:bg-pink-600 p-4 rounded-md transition duration-300 ease-in-out"
            >
              Generate Recipe
            </button>
            <h2 className="text-pink-700 text-xl font-semibold">{dish}</h2>
            <div className="w-full">
              <p className="text-pink-800 whitespace-pre-line">{recipe}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
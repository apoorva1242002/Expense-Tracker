import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#8e2de2", "#ff6a88", "#4facfe", "#43e97b", "#fa709a"];

function App() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const [people, setPeople] = useState(["Apoorva"]);
  const [selectedPerson, setSelectedPerson] = useState("Apoorva");
  const [newPerson, setNewPerson] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");

  // Fetch expenses from DB when app loads
  const fetchExpenses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/expenses");
      setExpenses(res.data);
    } catch (error) {
      console.log(error);
      alert("Error fetching expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add Person
  const addPerson = () => {
    if (!newPerson.trim()) return;

    if (people.includes(newPerson.trim())) {
      alert("Person already exists");
      return;
    }

    const updated = [...people, newPerson.trim()];
    setPeople(updated);
    setSelectedPerson(newPerson.trim());
    setNewPerson("");
    setShowAddInput(false);
  };

  // Add expense manually
  const handleSubmit = async () => {
    if (!title || !amount || !date) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:5000/add-expense", {
        title,
        amount,
        date,
        person: selectedPerson
      });

      alert("Expense Added Successfully");

      setTitle("");
      setAmount("");
      setDate("");

      fetchExpenses(); // refresh DB data
    } catch (error) {
      console.log(error);
      alert("Error saving expense");
    }
  };

  // Import website data into DB
  const importFromWebsite = async () => {
    try {
      const res = await axios.get("http://localhost:5000/import-expenses");
      alert(res.data);
      fetchExpenses();
    } catch (error) {
      console.log(error);
      alert("Error importing website data");
    }
  };

  const filteredExpenses =
    selectedMonth === "All"
      ? expenses
      : expenses.filter(
          (item) => new Date(item.date).getMonth() === Number(selectedMonth)
        );

  const total = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const personTotals = Object.values(
    filteredExpenses.reduce((acc, item) => {
      if (!acc[item.person]) {
        acc[item.person] = { name: item.person, total: 0 };
      }
      acc[item.person].total += Number(item.amount);
      return acc;
    }, {})
  );

  const chartData = Object.values(
    filteredExpenses.reduce((acc, item) => {
      if (!acc[item.person]) {
        acc[item.person] = { name: item.person, value: 0 };
      }
      acc[item.person].value += Number(item.amount);
      return acc;
    }, {})
  );

  return (
    <div className="container">
      <h1>💰 Expense Tracker</h1>

      <button className="add-btn" onClick={importFromWebsite}>
        Import From Website
      </button>

      {personTotals.length > 0 && (
        <div className="summary-section">
          {personTotals.map((person, index) => (
            <div className="summary-card" key={index}>
              <h4>{person.name}</h4>
              <p>₹ {person.total}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="form-grid">
          <input
            type="text"
            placeholder="Expense Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select
            value={selectedPerson}
            onChange={(e) => {
              if (e.target.value === "add-new") {
                setShowAddInput(true);
              } else {
                setSelectedPerson(e.target.value);
                setShowAddInput(false);
              }
            }}
          >
            {people.map((person, index) => (
              <option key={index} value={person}>
                {person}
              </option>
            ))}
            <option value="add-new">+ Add New Person</option>
          </select>

          <button className="add-btn" onClick={handleSubmit}>
            Add Expense
          </button>
        </div>

        {showAddInput && (
          <div className="inline-add-person">
            <input
              type="text"
              placeholder="Enter new person name"
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
            />
            <button onClick={addPerson}>Add</button>
          </div>
        )}
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>Select Month: </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All</option>
          <option value="0">January</option>
          <option value="1">February</option>
          <option value="2">March</option>
          <option value="3">April</option>
          <option value="4">May</option>
          <option value="5">June</option>
          <option value="6">July</option>
          <option value="7">August</option>
          <option value="8">September</option>
          <option value="9">October</option>
          <option value="10">November</option>
          <option value="11">December</option>
        </select>
      </div>

      <h2>Total: ₹ {total}</h2>

      <ul className="list">
        {filteredExpenses.map((item) => (
          <li key={item.id}>
            {item.title} - ₹ {item.amount} ({item.person}) - {item.date}
          </li>
        ))}
      </ul>

      {chartData.length > 0 && (
        <div className="chart-wrapper">
          <PieChart width={350} height={280}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      )}
    </div>
  );
}

export default App;
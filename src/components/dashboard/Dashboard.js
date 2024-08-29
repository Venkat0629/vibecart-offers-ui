import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './Dashboard.css'; 

const barData = [
  { name: '2022', ProductOffers: 300, SeasonalPromotion: 200, PriceDiscounts: 100 },
  { name: '2023', ProductOffers: 400, SeasonalPromotion: 300, PriceDiscounts: 200 },
  { name: '2024', ProductOffers: 500, SeasonalPromotion: 400, PriceDiscounts: 300 },
];

const pieData = [
  { name: 'Product Offers', value: 45 },
  { name: 'Seasonal Promotion', value: 35 },
  { name: 'Price Discounts', value: 20 },
];

const COLORS = ['#0292fa','#06eeee','#010344'];

function Dashboard() {
  return (
    <div className='dashboard'>
      <div className='offers'>
      <div>
      <h1>456</h1>
      <p className="offer-description">Total offers</p>
    </div>
    <div>
      <h1>200</h1>
      <p className="offer-description">Active offers</p>
    </div>
    <div>
      <h1>156</h1>
      <p className="offer-description">Expired offers</p>
    </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ProductOffers" fill="#0292fa" />
              <Bar dataKey="SeasonalPromotion" fill="#010344" />
              <Bar dataKey="PriceDiscounts" fill="#06eeee" />
            </BarChart>
          </ResponsiveContainer>
          <h3>Year Wise Used Offers</h3>
        </div>

        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#06eeee"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <h3>Most Used Offer Types</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

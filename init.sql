CREATE DATABASE IF NOT EXISTS subtracker;
USE subtracker;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  price        DECIMAL(10, 2) NOT NULL,
  currency     ENUM('USD','EUR','GBP','THB','JPY','CAD','AUD') NOT NULL DEFAULT 'USD',
  category     ENUM('Entertainment','Health','Productivity','Education','Utilities','Other')
               NOT NULL DEFAULT 'Other',
  billing_cycle ENUM('weekly','monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
  start_date   DATE,
  billing_date DATE NOT NULL,
  payment_method VARCHAR(255) DEFAULT '',
  status       ENUM('active','inactive','cancelled') NOT NULL DEFAULT 'active',
  notes        TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

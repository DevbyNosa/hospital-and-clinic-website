CREATE TABLE adminCredentials (
  id INT PRIMARY KEY,
  email_address VARCHAR(255),
  password VARCHAR(255)
);


CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE appointments ADD COLUMN viewed BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN viewed_at TIMESTAMP;




-- Database Schema for Contract SaaS Application

-- Table for storing agency/user information
CREATE TABLE agencies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    logo TEXT,
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing contract information
CREATE TABLE contracts (
    id VARCHAR(36) PRIMARY KEY,
    agency_id VARCHAR(36) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('client', 'hiring')),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    agency_name VARCHAR(255) NOT NULL,
    agency_email VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    payment_amount DECIMAL(15, 2) NOT NULL,
    payment_terms TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'signed', 'completed')),
    agency_signature TEXT,
    agency_signed_at TIMESTAMP NULL,
    client_signature TEXT,
    client_signed_at TIMESTAMP NULL,
    shareable_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

-- Table for storing contract scope items
CREATE TABLE contract_scopes (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NOT NULL,
    scope_item TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Table for storing contract clauses
CREATE TABLE contract_clauses (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at when rows are modified
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better query performance
CREATE INDEX idx_contracts_agency_id ON contracts(agency_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
CREATE INDEX idx_contract_scopes_contract_id ON contract_scopes(contract_id);
CREATE INDEX idx_contract_clauses_contract_id ON contract_clauses(contract_id);

-- Sample data for testing
INSERT INTO agencies (id, name, email) VALUES 
('1', 'Demo Agency', 'demo@agency.com');

INSERT INTO contracts (id, agency_id, type, client_name, client_email, agency_name, agency_email, project_title, project_description, payment_amount, payment_terms, start_date, status) VALUES 
('1', '1', 'client', 'John Doe', 'john@example.com', 'Demo Agency', 'demo@agency.com', 'Website Development', 'Build a responsive website', 5000.00, '50% upfront, 50% upon completion', '2025-08-10', 'draft');
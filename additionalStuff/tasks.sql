CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,      
    user_id UUID NOT NULL,  
    title VARCHAR(255) NOT NULL,   
    description TEXT,              
    completed BOOLEAN DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
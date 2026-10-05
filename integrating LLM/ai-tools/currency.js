import "dotenv/config";


export async function currencyExchange(from, to, amount) {
    console.log("Currency Exchage called\n")
    try {
        
        const response = await fetch(`https://v6.exchangerate-api.com/v6/a3c1ad19c7199a57eba9bbc2/latest/${from}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.result === "success") {
            // 3. Extract the specific rate for the target currency
            const rate = data.conversion_rates[to];
            if (!Number.isFinite(rate)) throw new Error(`Unsupported currency: ${to}`);
            
            // 4. Multiply the rate by your amount
            const convertedAmount = amount * rate;
            
            // Optional: Format the number to 2 decimal places
            const formattedResult = convertedAmount.toFixed(2);
            
            console.log(`${amount} ${from} = ${formattedResult} ${to}`);
            return convertedAmount;
        } else {
            throw new Error(`Currency API error: ${data['error-type']}`);
        }
        
    } catch (error) {
        throw error;
    }
}

// Example usage: Convert 1000 INR to USD

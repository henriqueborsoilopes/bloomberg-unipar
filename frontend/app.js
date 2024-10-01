let stompClient = null;
let connected = false;
let stocksLoaded = false;

function connect() {
    const socket = new SockJS('http://localhost:8080/stock-prices', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        stompClient.send("/app/connect", {}, JSON.stringify({ name: 'user' }));
        
        stompClient.subscribe('/topic/stock-prices', function(response) {
            const stocks = JSON.parse(response.body);           
            console.log('Received stocks:', stocks);
            if (!stocksLoaded) {
                createStockBlocks(stocks);
                stocksLoaded = true;
            } else {
                updateStockBlocks(stocks);
            }
        });
    }, function (error) {
        console.log('Connection lost, retrying in 5 seconds...', error);
        connected = false;
        setTimeout(reconnect, 5000);
    });
}

function reconnect() {
    if (!connected) {
        console.log('Reconnecting...');
        connect();
    }
}

function createStockBlocks(stocks) {
    const container = document.getElementById('stock-container');
    container.innerHTML = '';

    stocks.forEach(stock => {
        const stockBlock = document.createElement('div');
        stockBlock.className = 'stock-block';
        stockBlock.id = stock.name.replace(/\s+/g, '-').toLowerCase();

        const stockName = document.createElement('h2');
        stockName.innerText = stock.name;

        const stockPrice = document.createElement('p');
        stockPrice.innerText = stock.price.toFixed(2);

        stockBlock.appendChild(stockName);
        stockBlock.appendChild(stockPrice);

        container.appendChild(stockBlock);
    });
}

function updateStockBlocks(stocks) {
    const container = document.getElementById('stock-container');
    const existingIds = new Set();
    container.querySelectorAll('.stock-block').forEach(block => {
        existingIds.add(block.id);
    });

    stocks.forEach(stock => {
        const stockId = stock.name.replace(/\s+/g, '-').toLowerCase();
        const stockBlock = document.getElementById(stockId);

        if (stockBlock) {
            const stockPrice = stockBlock.querySelector('p');
            stockPrice.innerText = stock.price.toFixed(2);
            console.log(`Updated ${stock.name} with price: ${stock.price.toFixed(2)}`);
        } else {
            const newBlock = document.createElement('div');
            newBlock.className = 'stock-block';
            newBlock.id = stockId;

            const stockName = document.createElement('h2');
            stockName.innerText = stock.name;

            const stockPrice = document.createElement('p');
            stockPrice.innerText = stock.price.toFixed(2);

            newBlock.appendChild(stockName);
            newBlock.appendChild(stockPrice);

            container.appendChild(newBlock);

            console.log(`Created new stock block for ${stock.name}`);
        }
    });
}

window.onload = function() {
    connect();
};


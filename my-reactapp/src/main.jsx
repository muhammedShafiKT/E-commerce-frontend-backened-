// import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Cartprovider} from './assets/pages/user/Cartprovider.jsx'

import { WishlistProvider } from './assets/pages/user/Wishlistprovider.jsx'
createRoot(document.getElementById('root')).render(

  
<WishlistProvider>
  <Cartprovider>
    
     <App />
    </Cartprovider>
    </WishlistProvider>

         
  
   
 

 
  
)

import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import { ShoppingListProvider } from "./context/ShoppingListContext.tsx";
import ShoppingList from "./pages/ShoppingList.tsx";

export default function App() {
  return (
    <ShoppingListProvider>
      <Layout>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/recipe/:slug" component={RecipeDetail} />
          <Route path="/shopping-list" component={ShoppingList} />
        </Router>
      </Layout>
    </ShoppingListProvider>
  );
}

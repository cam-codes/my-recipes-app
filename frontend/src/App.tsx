import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';

export default function App() {
  return (
    <Layout>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/recipe/:slug" component={RecipeDetail} />
      </Router>
    </Layout>
  );
}

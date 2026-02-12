import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import ResumePage from './pages/ResumePage.tsx';

export default function App() {
  return (
    <Router>
      <Route path="/" component={Layout}>
        <Route path="/" component={Home} />
        <Route path="/recipe/:slug" component={RecipeDetail} />
        <Route path="/resume" component={ResumePage} />
      </Route>
    </Router>
  );
}

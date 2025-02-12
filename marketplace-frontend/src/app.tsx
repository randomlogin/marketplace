import { Router, Route } from 'preact-router';
import Header from './components/Header';
import Home from './Home';
import PostListing from './PostListing';
import ViewListing from './ViewListing';
import NotFound from './NotFound';
import FAQ from './FAQ';

export function App() {
  return (
    <div class="min-h-screen bg-gray-50">
      <Header />
      <main class="container mx-auto px-4 py-8">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/post" component={PostListing} />
          <Route path="/space/:name" component={ViewListing} />
          <Route path="/faq" component={FAQ} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </div>
  );
}

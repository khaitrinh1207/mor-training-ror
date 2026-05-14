import React from 'react';
import { createRoot } from 'react-dom/client';
import { CampaignActionItemsPage } from './bsmatch/pages/CampaignActionItemsPage';
import { DemoCampaignActionItemsRepository } from './bsmatch/infrastructures/demo/demoCampaignActionItemsRepository';
import './styles/campaignActionItems.css';

const rootElement = document.getElementById('root');
const params = new URLSearchParams(window.location.search);
const campaignId = Number(params.get('campaignId') ?? '1');
const repository = params.get('api') === '1' ? undefined : new DemoCampaignActionItemsRepository(campaignId);

if (!rootElement) {
  throw new Error('Root element was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <CampaignActionItemsPage campaignId={campaignId} repository={repository} />
  </React.StrictMode>
);

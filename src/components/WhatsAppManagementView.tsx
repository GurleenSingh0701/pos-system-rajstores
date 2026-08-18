import React, { useState } from 'react';
import { TemplateBuilder } from './whatsapp/TemplateBuilder';
import { CustomerCRM } from './whatsapp/CustomerCRM';
import { CampaignLauncher } from './whatsapp/CampaignLauncher';
import { WhatsAppSettings } from './whatsapp/WhatsAppSettings';

export const WhatsAppManagementView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  return (
    <div className="p-6">
      {activeTab === 'whatsapp_templates' && <TemplateBuilder />}
      {activeTab === 'whatsapp_crm' && <CustomerCRM />}
      {activeTab === 'whatsapp_campaigns' && <CampaignLauncher />}
      {activeTab === 'whatsapp_settings' && <WhatsAppSettings />}
    </div>
  );
};

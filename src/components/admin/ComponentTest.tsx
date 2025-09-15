import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ParticipantFormNew } from './ParticipantFormNew';
import { ProjectFormNew } from './ProjectFormNew';
import { SponsorFormNew } from './SponsorFormNew';
import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig } from '@/types/admin';

// Minimal test configuration for demonstration
const testConfig: AdminFormConfig = {
  title: 'Test Form',
  entityName: 'TestEntity',
  submitEndpoint: 'test-entities',
  fields: [
    {
      name: 'testField',
      label: 'Test Field',
      type: 'text',
      required: true,
      placeholder: 'Enter test value'
    }
  ]
};

export const ComponentTest = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const closeModal = () => setActiveTest(null);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Admin Components Compatibility Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setActiveTest('participant')}
              className="h-16 flex flex-col items-center justify-center"
            >
              <span>Test Participant Form</span>
              <small className="text-xs opacity-70">(New Consolidated)</small>
            </Button>
            <Button
              onClick={() => setActiveTest('project')}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span>Test Project Form</span>
              <small className="text-xs opacity-70">(New Consolidated)</small>
            </Button>
            <Button
              onClick={() => setActiveTest('sponsor')}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span>Test Sponsor Form</span>
              <small className="text-xs opacity-70">(New Consolidated)</small>
            </Button>
            <Button
              onClick={() => setActiveTest('generic')}
              variant="secondary"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span>Test Generic Form</span>
              <small className="text-xs opacity-70">(Base Component)</small>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Test Objectives:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>✅ Component renders without errors</li>
              <li>✅ Modal overlay appears correctly</li>
              <li>✅ Form fields display properly</li>
              <li>✅ Close button works</li>
              <li>✅ TypeScript compilation succeeds</li>
              <li>✅ No runtime console errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Modals */}
      {activeTest === 'participant' && (
        <ParticipantFormNew
          onClose={closeModal}
          initialData={{
            id: 'test-participant-id',
            name: 'Test Participant',
            slug: 'test-participant',
            bio: 'This is a test biography for compatibility testing.',
            website: 'https://example.com',
            avatar_path: null,
            social_links: [
              { platform: 'github', url: 'https://github.com/testuser' },
              { platform: 'twitter', url: 'https://twitter.com/testuser' }
            ],
            created_at: new Date().toISOString()
          }}
        />
      )}

      {activeTest === 'project' && (
        <ProjectFormNew
          onClose={closeModal}
          initialData={{
            id: 'test-project-id',
            title: 'Test Project',
            description: 'This is a test project for compatibility testing.',
            full_description: 'Extended description to test textarea rendering.',
            purpose: 'To test component compatibility',
            expected_impact: 'Improved component testing capabilities',
            image_path: null,
            associations: ['test', 'compatibility'],
            slug: 'test-project',
            created_at: new Date().toISOString()
          }}
        />
      )}

      {activeTest === 'sponsor' && (
        <SponsorFormNew
          onClose={closeModal}
          initialData={{
            id: 'test-sponsor-id',
            name: 'Test Sponsor Organization',
            type: 'partner',
            logo_path: null,
            website: 'https://testsponsor.com',
            created_at: new Date().toISOString()
          }}
        />
      )}

      {activeTest === 'generic' && (
        <GenericAdminForm
          config={testConfig}
          onClose={closeModal}
          onSubmit={async (data) => {
            console.log('Generic form submitted with data:', data);
            alert(`Generic form submitted with: ${Object.values(data).join(', ')}`);
          }}
          defaultValues={{ testField: 'Default test value' }}
        />
      )}
    </div>
  );
};

// Export for easy testing
export default ComponentTest;

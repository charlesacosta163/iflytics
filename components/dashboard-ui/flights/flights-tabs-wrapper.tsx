'use client'

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface FlightsTabsWrapperProps {
  children: React.ReactNode;
}

const FlightsTabsWrapper = ({ children }: FlightsTabsWrapperProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-8">
        {children}
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Analytics Tab</h2>
          <p className="text-gray-500">
            Advanced analytics and insights coming soon...
          </p>
          <div className="mt-8 p-8 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Placeholder Content</h3>
            <p className="text-gray-600">
              This is where additional flight analytics, trends, and detailed 
              insights will be displayed in the future.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default FlightsTabsWrapper;
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  backUrl?: string;
}

export function PageHeader({ title, action, backUrl }: PageHeaderProps) {
  return (
    <Card className="border-border bg-card w-full shadow-sm">
      <CardContent className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          {backUrl && (
            <Link 
              to={backUrl} 
              className="p-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardContent>
    </Card>
  );
}

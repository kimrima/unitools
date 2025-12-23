import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Users, Globe, Wrench, LogOut, TrendingUp, 
  ThumbsUp, Activity, Home
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface OverviewData {
  todayUsage: number;
  topTools: { toolId: string; count: number }[];
  countryStats: { countryCode: string; count: number }[];
}

interface ToolData {
  toolId: string;
  isActive: boolean;
  usageCount: number;
}

interface FeatureVote {
  toolId: string;
  count: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [tools, setTools] = useState<ToolData[]>([]);
  const [featureVotes, setFeatureVotes] = useState<FeatureVote[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check', { credentials: 'include' });
      const data = await res.json();
      if (!data.authenticated) {
        setLocation('/admin');
        return;
      }
      loadData();
    } catch {
      setLocation('/admin');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, toolsRes, votesRes] = await Promise.all([
        fetch('/api/admin/overview', { credentials: 'include' }),
        fetch('/api/admin/tools', { credentials: 'include' }),
        fetch('/api/admin/feature-votes', { credentials: 'include' }),
      ]);

      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }
      if (toolsRes.ok) {
        const data = await toolsRes.json();
        setTools(data.tools);
      }
      if (votesRes.ok) {
        const data = await votesRes.json();
        setFeatureVotes(data.votes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    setLocation('/admin');
  };

  const toggleToolActive = async (toolId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });

      if (res.ok) {
        setTools(tools.map(t => t.toolId === toolId ? { ...t, isActive } : t));
        toast({ title: 'Updated', description: `${toolId} is now ${isActive ? 'active' : 'inactive'}` });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update tool', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-bold truncate">UniTools Admin</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/en">
              <Button variant="ghost" size="icon" className="sm:hidden" data-testid="button-go-home-mobile">
                <Home className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={handleLogout} data-testid="button-admin-logout-mobile">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="overview" data-testid="tab-overview" className="flex-1 sm:flex-none">
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools" className="flex-1 sm:flex-none">
              <Wrench className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="votes" data-testid="tab-votes" className="flex-1 sm:flex-none">
              <ThumbsUp className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Votes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-today-usage">
                    {overview?.todayUsage || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total tool uses today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-tools">
                    {tools.filter(t => t.isActive).length} / {tools.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Tools currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Countries</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-countries">
                    {overview?.countryStats?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Countries using tools</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overview?.topTools?.map((tool, i) => (
                      <div key={tool.toolId} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{i + 1}.</span>
                          <span className="text-sm font-medium">{tool.toolId}</span>
                        </div>
                        <Badge variant="secondary">{tool.count}</Badge>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No data yet</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Top Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overview?.countryStats?.slice(0, 5).map((stat) => (
                      <div key={stat.countryCode} className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{stat.countryCode || 'Unknown'}</span>
                        <Badge variant="secondary">{stat.count}</Badge>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No data yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tool Management</CardTitle>
                <CardDescription>Enable or disable tools, view usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tools.map((tool) => (
                    <div 
                      key={tool.toolId} 
                      className="flex items-center justify-between gap-4 p-3 rounded-md border"
                      data-testid={`row-tool-${tool.toolId}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tool.toolId}</p>
                        <p className="text-xs text-muted-foreground">{tool.usageCount} uses</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Badge variant={tool.isActive ? 'default' : 'secondary'} className="hidden sm:inline-flex">
                          {tool.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={tool.isActive}
                          onCheckedChange={(checked) => toggleToolActive(tool.toolId, checked)}
                          data-testid={`switch-tool-${tool.toolId}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Votes</CardTitle>
                <CardDescription>Tools users want to see implemented</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featureVotes.length > 0 ? (
                    featureVotes.map((vote) => (
                      <div 
                        key={vote.toolId} 
                        className="flex items-center justify-between gap-4 p-3 rounded-md border"
                        data-testid={`row-vote-${vote.toolId}`}
                      >
                        <span className="text-sm font-medium">{vote.toolId}</span>
                        <Badge>{vote.count} votes</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No feature votes yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

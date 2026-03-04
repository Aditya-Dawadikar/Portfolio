import { DATA } from "@/data/resume";
import { StoryCard } from "@/components/story-card";

export const metadata = {
    title: "Stories",
    description: "Work experience stories and accomplishments.",
};

export default function Page() {
    const sortedStories = [...(DATA.stories || [])]
        .sort((a, b) => {
            const dateA = new Date(a.date || "0").getTime();
            const dateB = new Date(b.date || "0").getTime();
            return dateB - dateA;
        });

    return (
        <div className="space-y-6 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold">Stories</h1>
            <p>
                Over the past few years, I’ve worked on systems that operate at real production 
                scale — from real-time dashboards and AI processing pipelines to distributed 
                backend services and cost-optimized data platforms. Many of the most valuable 
                engineering lessons don’t appear in bullet points on a résumé: they emerge while 
                solving performance bottlenecks, debugging production incidents, or redesigning 
                systems under tight constraints. This page collects a few of those stories. Each 
                one describes a real engineering problem I encountered, the architectural decisions 
                behind the solution, and the impact it had on performance, scalability, or developer productivity.</p>
            {sortedStories.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No stories yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {sortedStories.map((story) => (
                        <StoryCard
                            key={story.title}
                            title={story.title}
                            company={story.company}
                            date={story.date}
                            description={story.description}
                            tags={story.tags}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

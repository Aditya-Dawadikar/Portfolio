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

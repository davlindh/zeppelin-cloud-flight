import React from 'react';
import { Skeleton } from './skeleton';
import { 
  SkeletonCard, 
  SkeletonList, 
  SkeletonImage, 
  SkeletonText,
  SkeletonTable,
  SkeletonProductCard,
  SkeletonProfile
} from './skeleton-variants';

/**
 * Demo component showing all skeleton loading states
 * Use these patterns during data fetching to improve perceived performance
 */
export const SkeletonDemo = () => {
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <section>
        <h2 className="text-2xl font-bold mb-4">Basic Skeletons</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Default (shimmer)</p>
            <Skeleton className="h-4 w-64" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Pulse animation</p>
            <Skeleton animation="pulse" className="h-4 w-64" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Avatar</p>
            <Skeleton variant="avatar" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Button</p>
            <Skeleton variant="button" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Card Skeletons</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">List Skeletons</h2>
        <SkeletonList items={4} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Image Skeletons</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Square</p>
            <SkeletonImage aspectRatio="square" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Video (16:9)</p>
            <SkeletonImage aspectRatio="video" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Portrait</p>
            <SkeletonImage aspectRatio="portrait" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Text Skeletons</h2>
        <SkeletonText lines={5} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Table Skeleton</h2>
        <SkeletonTable rows={5} columns={4} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Product Card Skeletons</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <SkeletonProductCard />
          <SkeletonProductCard />
          <SkeletonProductCard />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Profile Skeleton</h2>
        <div className="max-w-md">
          <SkeletonProfile />
        </div>
      </section>
    </div>
  );
};

/**
 * Usage Examples:
 * 
 * 1. Simple loading state:
 * ```tsx
 * {isLoading ? <Skeleton className="h-4 w-32" /> : <p>{data.title}</p>}
 * ```
 * 
 * 2. Card loading state:
 * ```tsx
 * {isLoading ? (
 *   <SkeletonCard />
 * ) : (
 *   <Card>{content}</Card>
 * )}
 * ```
 * 
 * 3. List loading state:
 * ```tsx
 * {isLoading ? (
 *   <SkeletonList items={5} />
 * ) : (
 *   items.map(item => <ListItem key={item.id} {...item} />)
 * )}
 * ```
 * 
 * 4. Image loading state:
 * ```tsx
 * {isLoading ? (
 *   <SkeletonImage aspectRatio="video" />
 * ) : (
 *   <img src={image} alt="..." />
 * )}
 * ```
 */

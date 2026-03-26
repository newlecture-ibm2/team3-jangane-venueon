import { WireframeNav } from "../components/WireframeNav";
import { useParams } from "react-router";
import { MessageSquare, ThumbsUp, Pin, Send } from "lucide-react";
import { useState } from "react";

export function CommunityPage() {
  const { seminarId } = useParams();
  const [newPost, setNewPost] = useState("");

  const posts = [
    {
      id: "1",
      author: "John Smith",
      role: "Attendee",
      content: "[Post content discussing the seminar topic, sharing insights, or asking questions about the material covered]",
      timestamp: "2 hours ago",
      likes: 12,
      comments: 5,
      isPinned: true,
    },
    {
      id: "2",
      author: "Tech University",
      role: "Organizer",
      content: "[Announcement or update from the seminar organizer about upcoming sessions, materials, or important information]",
      timestamp: "5 hours ago",
      likes: 24,
      comments: 8,
      isPinned: true,
    },
    {
      id: "3",
      author: "Sarah Johnson",
      role: "Attendee",
      content: "[Question or discussion point related to the seminar content, seeking clarification or additional resources]",
      timestamp: "1 day ago",
      likes: 8,
      comments: 3,
      isPinned: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <WireframeNav />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b-2 border-gray-400">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase">Community / Study Room</h1>
          <p className="text-gray-700 mb-4">AI in Modern Business Strategy</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">245 Members</span>
            <span>·</span>
            <span>32 Posts</span>
            <span>·</span>
            <span>Last activity: 1 hour ago</span>
          </div>
        </div>
        
        {/* Create Post */}
        <div className="mb-6 border-2 border-gray-700 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">Create Post</h2>
          
          <textarea 
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="[Share your thoughts, questions, or resources with the community...]"
            className="w-full px-4 py-3 border-2 border-gray-400 focus:border-gray-700 outline-none min-h-32 resize-y mb-3"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-medium hover:border-gray-800 text-sm">
                [Attach File]
              </button>
              <button className="px-4 py-2 border-2 border-gray-600 text-gray-700 font-medium hover:border-gray-800 text-sm">
                [Add Link]
              </button>
            </div>
            
            <button className="px-6 py-2 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900 flex items-center gap-2">
              <Send size={18} />
              Post
            </button>
          </div>
        </div>
        
        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id}
              className={`border-2 ${post.isPinned ? 'border-gray-800 bg-yellow-50' : 'border-gray-600 bg-white'} p-6`}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-300 border-2 border-gray-600 flex items-center justify-center text-xs">
                    [Img]
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{post.author}</p>
                      <span className={`px-2 py-0.5 text-xs font-bold ${
                        post.role === "Organizer" 
                          ? "bg-blue-600 text-white border border-blue-800" 
                          : "bg-gray-200 border border-gray-500 text-gray-700"
                      }`}>
                        {post.role.toUpperCase()}
                      </span>
                      {post.isPinned && (
                        <Pin size={16} className="text-gray-700" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{post.timestamp}</p>
                  </div>
                </div>
                
                <button className="px-3 py-1 border-2 border-gray-600 text-gray-700 text-sm font-medium hover:border-gray-800">
                  [...]
                </button>
              </div>
              
              {/* Post Content */}
              <div className="mb-4 text-gray-800 leading-relaxed">
                {post.content}
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center gap-4 pt-3 border-t-2 border-gray-300">
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-600 hover:border-gray-800 font-medium text-sm">
                  <ThumbsUp size={16} />
                  <span>{post.likes} Likes</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-600 hover:border-gray-800 font-medium text-sm">
                  <MessageSquare size={16} />
                  <span>{post.comments} Comments</span>
                </button>
              </div>
              
              {/* Comments Section (collapsed) */}
              {post.comments > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                  <button className="text-sm text-gray-700 font-medium hover:text-gray-900">
                    View {post.comments} comments →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Load More */}
        <div className="mt-6 text-center">
          <button className="px-8 py-3 border-2 border-gray-700 text-gray-800 font-bold hover:bg-gray-100">
            Load More Posts
          </button>
        </div>
        
        {/* Optional: Live Chat */}
        <div className="mt-8 border-2 border-gray-700 bg-white p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase">Live Chat (Optional)</h3>
          
          <div className="border-2 border-gray-400 bg-gray-50 p-4 h-64 mb-3 overflow-y-auto">
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-bold text-gray-900">User1:</span>
                <span className="text-gray-700">[Chat message content]</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-gray-900">User2:</span>
                <span className="text-gray-700">[Chat message content]</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-gray-900">User3:</span>
                <span className="text-gray-700">[Chat message content]</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="[Type a message...]"
              className="flex-1 px-4 py-2 border-2 border-gray-400 focus:border-gray-700 outline-none"
            />
            <button className="px-6 py-2 bg-gray-800 text-white font-bold hover:bg-gray-900 border-2 border-gray-900">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

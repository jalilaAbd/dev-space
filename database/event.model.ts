import {Schema, model, models, Document} from 'mongoose';

//Event interface
export interface IEvent extends Document{
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;  
}

const EventSchema = new Schema<IEvent>(
    {
        title:{
            type:String,
            required:[true, "Please provide a title for the event"],
            trim:true,
            maxlength:[100, "Title cannot be more than 100 characters"]
        },
        slug:{
            type:String,
            unique:true,
            lowercase:true,
            trim:true
        },
        description:{
            type:String,
            required:[true, "Please provide a description for the event"],
            trim:true,
            maxlength:[1000, "Description cannot be more than 1000 characters"],
        },
        overview:{
            type:String,
            required:[true, "Please provide an overview for the event"],
            trim:true,
            maxlength:[500, "Overview cannot be more than 500 characters"],
        },
        image:{
            type:String,
            required:[true, "Please provide an image URL for the event"],
            trim:true,
        },
        venue:{
            type:String,
            required:[true, "Please provide a venue for the event"],
            trim:true,
        },
        location:{
            type:String,
            required:[true, "Please provide a location for the event"],
            trim:true,
        },
        date:{
            type:String,
            required:[true, "Please provide a date for the event"],
        },
        time:{
            type:String,
            required:[true, "Please provide a time for the event"],
        },
        mode:{
            type:String,
            required:[true, "Please provide a mode for the event"],
            enum:{
                values:["online", "offline", "hybrid"],
                message:"Mode must be either online, offline, or hybrid"
            }
        },
        audience:{
            type:String,
            required:[true, "Please provide an audience for the event"],
            trim:true,
        },
        agenda:{    
            type:[String],
            required:[true, "Please provide an agenda for the event"],
            validate:{
                validator:function(value:string[]){
                    return value.length > 0;
                },
                message:"Agenda must have at least one item"
            },
        },
        organizer:{
            type:String,
            required:[true, "Please provide an organizer for the event"],
            trim:true,  
        },
        tags:{
            type:[String],
            required:[true, "Please provide at least one tag for the event"],
            validate:{ 
                validator:function(value:string[]){
                    return value.length > 0;
                },
                message:"There must be at least one tag"
            },
        },
    },
    {
        timestamps:true  // Automatically add createdAt and updatedAt fields
        }
    
    );

    // Pre-save hook for slug generation and data normalization
    EventSchema.pre('save', async function(){
        const event = this as IEvent;
        // Generate slug from title if not provided or if title has changed
        if(event.isNew || event.isModified('title')){
            event.slug = await generateSlug(event.title);
        }
        // Normalize tags to lowercase and trim whitespace
        if(event.tags && event.tags.length > 0){
            event.tags = event.tags.map(tag => tag.toLowerCase().trim());
        }
        //Normalize date to ISO format (YYYY-MM-DD)
        if(event.isDirectSelected('date')){
            event.date = await normalizeDate(event.date);
        }
        //Normalize time to 24-hour format (HH:mm)
        if(event.isModified('time')){
            event.time = await normalizeTime(event.time);
        }

    });

    // Function to generate slug from title
    function generateSlug(title:string):string{
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
    }

    
// Helper function to normalize date to ISO format
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Helper function to normalize time format
function normalizeTime(timeString: string): string {
  // Handle various time formats and convert to HH:MM (24-hour format)
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);
  
  if (!match) {
    throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
  }
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();
  
  if (period) {
    // Convert 12-hour to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  
  if (hours < 0 || hours > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59) {
    throw new Error('Invalid time values');
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Create unique index on slug for better performance
EventSchema.index({ slug: 1 }, { unique: true });

// Create compound index for common queries
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
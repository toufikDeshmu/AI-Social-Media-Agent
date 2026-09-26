from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

import os
import json
import re
import asyncio


# =========================================================
# DATABASE IMPORTS
# =========================================================

from database import (
    init_db,
    engine,
    SessionLocal,
    PostDB
)


# =========================================================
# ENVIRONMENT / GROQ
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing from the .env file"
    )


groq_client = Groq(
    api_key=GROQ_API_KEY
)


MODEL_NAME = "openai/gpt-oss-120b"


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Social Media Agent"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

init_db()


# =========================================================
# DATABASE MIGRATION
# =========================================================

with engine.connect() as connection:

    # -----------------------------------------------------
    # scheduled_at
    # -----------------------------------------------------

    try:

        connection.execute(
            text(
                "ALTER TABLE posts "
                "ADD COLUMN scheduled_at DATETIME"
            )
        )

        connection.commit()

        print(
            "Added scheduled_at column."
        )

    except Exception:
        pass

    # -----------------------------------------------------
    # repurposed_content
    # -----------------------------------------------------

    try:

        connection.execute(
            text(
                "ALTER TABLE posts "
                "ADD COLUMN repurposed_content TEXT"
            )
        )

        connection.commit()

        print(
            "Added repurposed_content column."
        )

    except Exception:
        pass


    # -----------------------------------------------------
    # status
    # -----------------------------------------------------

    try:

        connection.execute(
            text(
                "ALTER TABLE posts "
                "ADD COLUMN status "
                "VARCHAR(50) DEFAULT 'draft'"
            )
        )

        connection.commit()

        print(
            "Added status column."
        )

    except Exception:
        pass


    # -----------------------------------------------------
    # published_at
    # -----------------------------------------------------

    try:

        connection.execute(
            text(
                "ALTER TABLE posts "
                "ADD COLUMN published_at DATETIME"
            )
        )

        connection.commit()

        print(
            "Added published_at column."
        )

    except Exception:
        pass
# =========================================================
# SCHEDULED POST CHECKER
# =========================================================

async def scheduled_post_checker():

    print("Scheduled post checker started.")

    while True:

        try:

            db = SessionLocal()

            try:

                now = datetime.utcnow()

                scheduled_posts = (
                    db.query(PostDB)
                    .filter(
                        PostDB.status == "scheduled",
                        PostDB.scheduled_at <= now
                    )
                    .all()
                )

                for post in scheduled_posts:

                    print(
                        f"Scheduled time reached for Post {post.id}."
                    )

                    try:

                        post.status = "published"
                        post.published_at = datetime.utcnow()
                        post.scheduled_at = None

                        db.commit()

                        print(
                            f"Post {post.id} automatically published."
                        )

                    except Exception as error:

                        db.rollback()

                        print(
                            f"Automatic publishing failed for Post {post.id}:",
                            error
                        )

            finally:

                db.close()

        except Exception as error:

            print(
                "Scheduled post checker error:",
                error
            )

        await asyncio.sleep(10)


# =========================================================
# START SCHEDULED POST CHECKER
# =========================================================

@app.on_event("startup")
async def start_scheduler():

    asyncio.create_task(
        scheduled_post_checker()
    )



# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message":
            "AI Social Media Agent API is running."
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy"
    }


# =========================================================
# REQUEST MODELS
# =========================================================

class GeneratePostRequest(BaseModel):

    platform: str
    topic: str
    contentType: str
    tone: str
    audience: str
    instructions: str
    brandSettings: dict = {}


class OrchestratorRequest(BaseModel):

    platform: str
    topic: str
    contentType: str
    tone: str
    audience: str
    instructions: str = ""


class ReviewPostRequest(BaseModel):

    post_id: int
    content: str
    brandSettings: dict = {}


class ImprovePostRequest(BaseModel):

    post_id: int
    content: str
    feedback: str
    suggestions: list[str]


class ApprovePostRequest(BaseModel):

    post_id: int


class SchedulePostRequest(BaseModel):

    post_id: int
    scheduled_at: str


class CancelScheduleRequest(BaseModel):

    post_id: int


class RepurposePostRequest(BaseModel):

    post_id: int


class PublishPostRequest(BaseModel):

    post_id: int


# =========================================================
# GET ALL POSTS
# =========================================================

@app.get("/api/posts")
def get_posts():

    db = SessionLocal()

    try:

        posts = (
            db.query(PostDB)
            .order_by(
                PostDB.created_at.desc()
            )
            .all()
        )

        result = []

        for post in posts:

            # =================================================
            # REVIEW SUGGESTIONS
            # =================================================

            suggestions = []

            if post.review_suggestions:

                try:

                    suggestions = json.loads(
                        post.review_suggestions
                    )

                    if not isinstance(
                        suggestions,
                        list
                    ):

                        suggestions = [
                            str(suggestions)
                        ]

                except Exception:

                    suggestions = [
                        post.review_suggestions
                    ]


            # =================================================
            # REPURPOSED CONTENT
            # =================================================

            repurposed_content = {}

            if post.repurposed_content:

                try:

                    repurposed_content = json.loads(
                        post.repurposed_content
                    )

                    if not isinstance(
                        repurposed_content,
                        dict
                    ):

                        repurposed_content = {}

                except Exception:

                    repurposed_content = {}


            # =================================================
            # POST RESULT
            # =================================================

            result.append({

                "id":
                    post.id,

                "platform":
                    post.platform,

                "topic":
                    post.topic,

                "contentType":
                    post.content_type,

                "tone":
                    post.tone,

                "audience":
                    post.audience,

                "instructions":
                    post.instructions,

                "content":
                    post.content,

                "reviewScore":
                    post.review_score,

                "reviewFeedback":
                    post.review_feedback,

                "reviewSuggestions":
                    suggestions,

                "improvedContent":
                    post.improved_content,

                "repurposedContent":
                    repurposed_content,

                "approved":
                    post.approved,

                "scheduledAt": (
                    post.scheduled_at.isoformat()
                    if post.scheduled_at
                    else None
                ),

                "publishedAt": (
                    post.published_at.isoformat()
                    if post.published_at
                    else None
                ),

                "status":
                    post.status,

                "createdAt": (
                    post.created_at.isoformat()
                    if post.created_at
                    else None
                )

            })

        return result

    finally:

        db.close()
@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int):

    db = SessionLocal()

    try:

        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == post_id
            )
            .first()
        )

        if not post:
            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )

        db.delete(post)
        db.commit()

        print(
            f"Post {post_id} deleted successfully."
        )

        return {
            "message": "Post deleted successfully.",
            "post_id": post_id
        }

    except HTTPException:
        raise

    except Exception as error:

        db.rollback()

        print(
            "Delete post error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete post."
        )

    finally:
        db.close()
# =========================================================
# CONTENT AGENT
# =========================================================

@app.post("/api/generate-post")
def generate_post(
    request: GeneratePostRequest
):

    db = SessionLocal()

    try:

        # =================================================
        # VALIDATE TOPIC
        # =================================================

        topic = request.topic.strip()

        suspicious_patterns = [

            "import {",
            "from react",
            "useEffect(",
            "useState(",
            "function Dashboard",
            "lucide-react",
            "BrowserRouter",
            "Routes,",
            "export default",
            "className=",

        ]

        if not topic:

            raise HTTPException(
                status_code=400,
                detail="Topic is required."
            )


        if len(topic) > 255:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Topic must be 255 characters "
                    "or less."
                )
            )


        if any(
            pattern.lower() in topic.lower()
            for pattern in suspicious_patterns
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please enter a normal topic, "
                    "not source code."
                )
            )


        # =================================================
        # BRAND SETTINGS
        # =================================================

        brand_name = request.brandSettings.get(
            "brandName",
            ""
        )

        brand_description = request.brandSettings.get(
            "description",
            ""
        )

        brand_audience = request.brandSettings.get(
            "audience",
            ""
        )

        brand_tone = request.brandSettings.get(
            "tone",
            ""
        )

        brand_style = request.brandSettings.get(
            "style",
            ""
        )

        brand_avoid = request.brandSettings.get(
            "avoid",
            ""
        )


        # =================================================
        # CONTENT GENERATION PROMPT
        # =================================================

        prompt = f"""
You are a professional AI social media content creator
and brand voice specialist.

Create a high-quality social media post using the
information below.

POST REQUIREMENTS
-----------------

Platform:
{request.platform}

Topic:
{topic}

Content Type:
{request.contentType}

Requested Tone:
{request.tone}

Target Audience:
{request.audience}

Additional Instructions:
{request.instructions}


BRAND VOICE
-----------

Brand Name:
{brand_name}

Brand Description:
{brand_description}

Brand Target Audience:
{brand_audience}

Preferred Brand Tone:
{brand_tone}

Writing Style:
{brand_style}

Things to Avoid:
{brand_avoid}


CONTENT REQUIREMENTS
--------------------

1. Follow the selected platform's style.

2. Follow the requested tone.

3. Follow the saved brand voice whenever
   brand information is provided.

4. Keep the content relevant to the topic.

5. Make the content engaging, useful and natural.

6. Adapt the content to the target audience.

7. Follow the specified writing style.

8. Avoid anything listed under "Things to Avoid".

9. Use appropriate platform formatting.

10. Use relevant hashtags only when suitable.

11. Do not use unnecessary hashtags.

12. Do not invent statistics.

13. Do not invent companies.

14. Do not invent studies or research.

15. Do not invent customer results.

16. Do not invent business achievements.

17. Do not make unsupported factual claims.

18. Only state factual information that is provided
    by the user or is clearly supported by the topic.

19. Keep the content professional and readable.

20. Return ONLY the final social media post.

Do not explain your reasoning.
Do not include labels such as "Generated Post:".
"""


        # =================================================
        # GROQ
        # =================================================

        completion = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are a professional social "
                            "media content creator and "
                            "brand voice specialist."
                        )
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }

                ],

                temperature=0.7,

                max_tokens=500
            )
        )


        generated_content = (
            completion
            .choices[0]
            .message
            .content
            .strip()
        )


        if not generated_content:

            raise HTTPException(
                status_code=500,
                detail="AI returned empty content."
            )


        # =================================================
        # SAVE POST
        # =================================================

        new_post = PostDB(

            platform=request.platform,

            topic=topic,

            content_type=request.contentType,

            tone=request.tone,

            audience=request.audience,

            instructions=request.instructions,

            content=generated_content,

            approved=False,

            status="draft"

        )


        db.add(new_post)

        db.commit()

        db.refresh(new_post)


        return {

            "id":
                new_post.id,

            "content":
                generated_content

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Content generation error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "AI content generation failed."
            )

        )


    finally:

        db.close()


# =========================================================
# REVIEW AGENT
# =========================================================

@app.post("/api/review-post")
def review_post(
    request: ReviewPostRequest
):

    db = SessionLocal()

    try:

        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        # =================================================
        # BRAND SETTINGS
        # =================================================

        brand_name = request.brandSettings.get(
            "brandName",
            ""
        )

        brand_description = request.brandSettings.get(
            "description",
            ""
        )

        brand_audience = request.brandSettings.get(
            "audience",
            ""
        )

        brand_tone = request.brandSettings.get(
            "tone",
            ""
        )

        brand_style = request.brandSettings.get(
            "style",
            ""
        )

        brand_avoid = request.brandSettings.get(
            "avoid",
            ""
        )


        # =================================================
        # REVIEW PROMPT
        # =================================================

        prompt = f"""
You are an expert AI social media review agent
and brand consistency analyst.

Review the following social media post.

POST
----

{request.content}


POST CONTEXT
------------

Platform:
{post.platform or ""}

Content Type:
{post.content_type or ""}

Requested Tone:
{post.tone or ""}

Target Audience:
{post.audience or ""}

Additional Instructions:
{post.instructions or ""}


BRAND VOICE
-----------

Brand Name:
{brand_name}

Brand Description:
{brand_description}

Brand Target Audience:
{brand_audience}

Preferred Brand Tone:
{brand_tone}

Writing Style:
{brand_style}

Things to Avoid:
{brand_avoid}


EVALUATION CRITERIA
-------------------

Evaluate the post on:

1. Engagement
2. Clarity
3. Relevance
4. Platform suitability
5. Tone consistency
6. Audience suitability
7. Brand voice consistency
8. Overall content quality
9. Factual reliability


IMPORTANT
---------

- Check whether the post follows the requested tone.
- Check whether the post matches the target audience.
- Check whether it follows the provided instructions.
- Check whether it matches the brand voice.
- Check the writing style.
- Check whether it violates anything listed
  under "Things to Avoid".
- Identify unsupported statistics.
- Identify invented companies.
- Identify invented studies.
- Identify invented achievements.
- Identify invented customer results.
- Do not penalize the post for not containing
  information that was not requested.
- Give practical suggestions that can actually
  improve the post.
- Do not rewrite the entire post.
- Be specific and concise.


SCORING
-------

Give an overall score from 1 to 10.

Return ONLY valid JSON.

Use exactly this format:

{{
    "score": 8,
    "feedback": "Short overall feedback about the post.",
    "suggestions": [
        "Specific improvement suggestion 1",
        "Specific improvement suggestion 2",
        "Specific improvement suggestion 3"
    ]
}}

The score must be a number from 1 to 10.

Do not include markdown.
Do not include ```json.
Do not include any text outside the JSON.
"""


        # =================================================
        # GROQ REVIEW
        # =================================================

        completion = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are a professional social "
                            "media content reviewer and "
                            "brand consistency analyst."
                        )
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }

                ],

                temperature=0.4,

                max_tokens=500
            )
        )


        raw_content = (
            completion
            .choices[0]
            .message
            .content
            .strip()
        )


        print(
            "AI Review Response:"
        )

        print(
            raw_content
        )


        # =================================================
        # PARSE JSON
        # =================================================

        try:

            review = json.loads(
                raw_content
            )

        except json.JSONDecodeError:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned invalid "
                    "review JSON."
                )
            )


        try:

            score = int(
                review.get(
                    "score",
                    0
                )
            )

        except (ValueError, TypeError):

            score = 1


        score = max(
            1,
            min(
                score,
                10
            )
        )


        feedback = review.get(
            "feedback",
            ""
        )


        suggestions = review.get(
            "suggestions",
            []
        )


        if not isinstance(
            suggestions,
            list
        ):

            suggestions = []


        # =================================================
        # SAVE REVIEW
        # =================================================

        post.review_score = score

        post.review_feedback = feedback

        post.review_suggestions = json.dumps(
            suggestions
        )

        db.commit()

        db.refresh(post)


        return {

            "id":
                post.id,

            "score":
                score,

            "feedback":
                feedback,

            "suggestions":
                suggestions

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Review error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="AI review failed."
        )


    finally:

        db.close()


# =========================================================
# IMPROVE AGENT
# =========================================================

@app.post("/api/improve-post")
def improve_post(
    request: ImprovePostRequest
):

    db = SessionLocal()

    try:

        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        suggestions_text = "\n".join(

            [
                f"- {item}"
                for item in request.suggestions
            ]

        )


        prompt = f"""
You are an expert social media content improvement agent.

Improve the following social media post based on
the AI review.

ORIGINAL POST
-------------

{request.content}


AI REVIEW
---------

Feedback:
{request.feedback}

Suggestions:
{suggestions_text}


POST CONTEXT
------------

Platform:
{post.platform or ""}

Topic:
{post.topic or ""}

Content Type:
{post.content_type or ""}

Tone:
{post.tone or ""}

Target Audience:
{post.audience or ""}

Instructions:
{post.instructions or ""}


IMPROVEMENT REQUIREMENTS
------------------------

1. Improve clarity.
2. Improve engagement.
3. Improve readability.
4. Improve structure where necessary.
5. Follow the original topic.
6. Maintain the requested platform style.
7. Maintain the requested tone.
8. Maintain suitability for the target audience.
9. Apply the review suggestions.
10. Preserve factual information.
11. Do not invent statistics.
12. Do not invent companies.
13. Do not invent studies.
14. Do not invent customer results.
15. Do not invent achievements.
16. Do not add unsupported factual claims.
17. Do not explain the changes.
18. Return ONLY the improved social media post.
"""


        completion = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are a professional social "
                            "media content improvement agent."
                        )
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }

                ],

                temperature=0.6,

                max_tokens=600
            )
        )


        improved_content = (
            completion
            .choices[0]
            .message
            .content
            .strip()
        )


        if not improved_content:

            raise HTTPException(
                status_code=500,
                detail="AI returned empty improved content."
            )


        # =================================================
        # SAVE IMPROVED CONTENT
        # =================================================

        post.improved_content = improved_content

        db.commit()

        db.refresh(post)


        return {

            "id":
                post.id,

            "content":
                improved_content,

            "improvedContent":
                improved_content

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Improve error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "AI post improvement failed."
            )
        )


    finally:

        db.close()


# =========================================================
# APPROVE POST
# =========================================================

@app.post("/api/approve-post")
def approve_post(
    request: ApprovePostRequest
):

    db = SessionLocal()

    try:

        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )

        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )

        if post.status == "published":

            raise HTTPException(
                status_code=400,
                detail="Published posts cannot be modified."
            )

        # =================================================
        # APPROVE POST
        # =================================================

        post.approved = True

        post.status = "approved"

        db.commit()

        db.refresh(post)

        print(
            f"Post {post.id} approved successfully."
        )

        # =================================================
        # AUTOMATIC REPURPOSING AFTER APPROVAL
        # =================================================

        repurpose_result = None

        try:

            repurpose_result = repurpose_post(
                RepurposePostRequest(
                    post_id=post.id
                )
            )

            print(
                f"Post {post.id} repurposed successfully."
            )

        except Exception as error:

            print(
                "Repurpose after approval failed:",
                error
            )

            repurpose_result = {
                "saved": False,
                "error": (
                    "Post approved, but "
                    "repurposing failed."
                )
            }

        # =================================================
        # RETURN APPROVAL + REPURPOSE RESULT
        # =================================================

        return {

            "id":
                post.id,

            "approved":
                post.approved,

            "status":
                post.status,

            "repurpose":
                repurpose_result

        }

    except HTTPException:

        raise

    except Exception as error:

        db.rollback()

        print(
            "Approve error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Post approval failed."
        )

    finally:

        db.close()
# =========================================================
# SCHEDULE POST
# =========================================================

@app.post("/api/schedule-post")
def schedule_post(
    request: SchedulePostRequest
):

    db = SessionLocal()

    try:

        print(
            "Schedule request received:"
        )

        print(
            "Post ID:",
            request.post_id
        )

        print(
            "Scheduled At:",
            request.scheduled_at
        )


        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        if post.status == "published":

            raise HTTPException(
                status_code=400,
                detail="Published posts cannot be scheduled."
            )


        if not post.approved:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved posts "
                    "can be scheduled."
                )
            )


        try:

            scheduled_datetime = datetime.fromisoformat(
                request.scheduled_at
            )

        except ValueError:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid scheduled_at format. "
                    "Use ISO datetime format."
                )
            )


        post.scheduled_at = scheduled_datetime

        post.status = "scheduled"


        db.commit()

        db.refresh(post)


        print(
            "Post scheduled successfully:",
            post.id
        )


        return {

            "id":
                post.id,

            "scheduledAt":
                post.scheduled_at.isoformat(),

            "status":
                post.status

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Schedule error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Post scheduling failed."
        )


    finally:

        db.close()


# =========================================================
# CANCEL SCHEDULE
# =========================================================

@app.post("/api/cancel-schedule")
def cancel_schedule(
    request: CancelScheduleRequest
):

    db = SessionLocal()

    try:

        print(
            "Cancel schedule request received:"
        )

        print(
            "Post ID:",
            request.post_id
        )


        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        if post.status == "published":

            raise HTTPException(
                status_code=400,
                detail="Published posts cannot be rescheduled."
            )


        post.scheduled_at = None


        if post.approved:

            post.status = "approved"

        else:

            post.status = "draft"


        db.commit()

        db.refresh(post)


        print(
            "Schedule cancelled successfully:",
            post.id
        )


        return {

            "id":
                post.id,

            "scheduledAt":
                None,

            "status":
                post.status

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Cancel schedule error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Schedule cancellation failed."
            )
        )


    finally:

        db.close()


# =========================================================
# ORCHESTRATOR AGENT
# =========================================================

@app.post("/api/orchestrate")
def orchestrate_post(
    request: OrchestratorRequest
):

    db = SessionLocal()

    try:

        print(
            "================================================="
        )

        print(
            "ORCHESTRATOR REQUEST RECEIVED"
        )

        print(
            "Platform:",
            request.platform
        )

        print(
            "Topic:",
            request.topic
        )

        print(
            "================================================="
        )


        # =================================================
        # STEP 1 — VALIDATE TOPIC
        # =================================================

        topic = request.topic.strip()


        if not topic:

            raise HTTPException(
                status_code=400,
                detail="Topic is required."
            )


        if len(topic) > 255:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Topic must be 255 characters "
                    "or less."
                )
            )


        # =================================================
        # STEP 2 — CONTENT AGENT
        # =================================================

        print(
            "Starting Content Agent..."
        )


        content_prompt = f"""
You are the Content Agent inside an AI Social Media
Agent system.

Create a high-quality social media post using these
requirements:

Platform:
{request.platform}

Topic:
{request.topic}

Content Type:
{request.contentType}

Tone:
{request.tone}

Target Audience:
{request.audience}

Additional Instructions:
{request.instructions}


CONTENT RULES
-------------

1. Make the content useful and engaging.

2. Follow the selected platform style.

3. Follow the requested tone.

4. Match the target audience.

5. Keep the content relevant to the topic.

6. Do not invent statistics.

7. Do not invent research findings.

8. Do not invent testimonials.

9. Do not invent companies.

10. Do not invent achievements.

11. Do not make unsupported factual claims.

12. Return ONLY the final social media post.

Do not explain your reasoning.
Do not include labels.
"""


        content_response = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are the Content Agent "
                            "of an AI social media "
                            "automation system."
                        )
                    },

                    {
                        "role": "user",
                        "content": content_prompt
                    }

                ],

                temperature=0.7,

                max_tokens=500
            )
        )


        generated_content = (
            content_response
            .choices[0]
            .message
            .content
            .strip()
        )


        if not generated_content:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Content Agent returned "
                    "empty content."
                )
            )


        print(
            "Content Agent completed."
        )


        # =================================================
        # STEP 3 — SAVE DRAFT
        # =================================================

        post = PostDB(

            platform=request.platform,

            topic=topic,

            content_type=request.contentType,

            tone=request.tone,

            audience=request.audience,

            instructions=request.instructions,

            content=generated_content,

            status="draft",

            approved=False

        )


        db.add(post)

        db.commit()

        db.refresh(post)


        print(
            "Draft saved:",
            post.id
        )


        # =================================================
        # STEP 4 — REVIEW AGENT
        # =================================================

        print(
            "Starting Review Agent..."
        )


        review_prompt = f"""
You are the Review Agent in an AI Social Media
Agent system.

Review this social media post:

{generated_content}


POST CONTEXT
------------

Platform:
{request.platform}

Topic:
{request.topic}

Content Type:
{request.contentType}

Tone:
{request.tone}

Target Audience:
{request.audience}

Additional Instructions:
{request.instructions}


EVALUATE
--------

1. Clarity
2. Relevance
3. Engagement
4. Professional quality
5. Accuracy
6. Audience suitability
7. Platform suitability
8. Tone consistency


IMPORTANT
---------

Do not reward unsupported statistics.

Do not reward fabricated claims.

Do not invent information.

Give practical improvement suggestions.


Return your response in exactly this format:

SCORE: <number from 1 to 10>

FEEDBACK:
<short feedback>

SUGGESTIONS:
<suggestion 1>
<suggestion 2>
<suggestion 3>
"""


        review_response = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are the Review Agent "
                            "of an AI social media "
                            "automation system."
                        )
                    },

                    {
                        "role": "user",
                        "content": review_prompt
                    }

                ],

                temperature=0.3,

                max_tokens=500
            )
        )


        review_text = (
            review_response
            .choices[0]
            .message
            .content
            .strip()
        )


        print(
            "Review Agent completed."
        )

        print(
            "Review Response:"
        )

        print(
            review_text
        )


        # =================================================
        # STEP 5 — EXTRACT SCORE
        # =================================================

        score_match = re.search(
            r"SCORE:\s*(\d+)",
            review_text,
            re.IGNORECASE
        )


        review_score = (

            int(
                score_match.group(1)
            )

            if score_match

            else None

        )


        if review_score is not None:

            review_score = max(
                1,
                min(
                    review_score,
                    10
                )
            )


        # =================================================
        # EXTRACT FEEDBACK
        # =================================================

        feedback_match = re.search(
            r"FEEDBACK:\s*(.*?)(?=SUGGESTIONS:|$)",
            review_text,
            re.IGNORECASE | re.DOTALL
        )


        review_feedback = (

            feedback_match
            .group(1)
            .strip()

            if feedback_match

            else review_text

        )


        # =================================================
        # EXTRACT SUGGESTIONS
        # =================================================

        suggestions_match = re.search(
            r"SUGGESTIONS:\s*(.*)",
            review_text,
            re.IGNORECASE | re.DOTALL
        )


        if suggestions_match:

            suggestions_text = (
                suggestions_match
                .group(1)
                .strip()
            )

        else:

            suggestions_text = ""


        review_suggestions = [

            line.strip(
                "-• \t0123456789."
            )

            for line in suggestions_text.splitlines()

            if line.strip()

        ]


        # =================================================
        # STEP 6 — SAVE REVIEW
        # =================================================

        post.review_score = review_score

        post.review_feedback = review_feedback

        post.review_suggestions = json.dumps(
            review_suggestions
        )


        db.commit()

        db.refresh(post)


        print(
            "Review saved."
        )


        # =================================================
        # STEP 7 — ORCHESTRATOR QUALITY DECISION
        # =================================================

        print(
            "================================================="
        )

        print(
            "ORCHESTRATOR QUALITY DECISION"
        )

        print(
            "Review Score:",
            review_score
        )


        improved_content = None

        improve_status = "waiting"

        approval_status = "waiting"


        # -------------------------------------------------
        # QUALITY THRESHOLD
        # -------------------------------------------------

        QUALITY_THRESHOLD = 8


        if (
            review_score is not None
            and review_score >= QUALITY_THRESHOLD
        ):

            # ---------------------------------------------
            # GOOD QUALITY
            # ---------------------------------------------

            print(
                "Quality decision: GOOD"
            )

            print(
                "Score is >= 8."
            )

            print(
                "Improvement is not required."
            )


            improve_status = "not_required"

            approval_status = "waiting"


        else:

            # ---------------------------------------------
            # NEEDS IMPROVEMENT
            # ---------------------------------------------

            print(
                "Quality decision: NEEDS IMPROVEMENT"
            )

            print(
                "Starting Improve Agent..."
            )


            suggestions_text = "\n".join(

                [
                    f"- {item}"
                    for item in review_suggestions
                ]

            )


            improve_prompt = f"""
You are the Improve Agent inside an AI Social Media
Agent system.

Improve the following social media post based on the
Review Agent's feedback and suggestions.

ORIGINAL POST
-------------

{generated_content}


REVIEW FEEDBACK
---------------

{review_feedback}


REVIEW SUGGESTIONS
------------------

{suggestions_text}


POST CONTEXT
------------

Platform:
{request.platform}

Topic:
{request.topic}

Content Type:
{request.contentType}

Tone:
{request.tone}

Target Audience:
{request.audience}

Additional Instructions:
{request.instructions}


IMPROVEMENT REQUIREMENTS
------------------------

1. Improve clarity.

2. Improve engagement.

3. Improve readability.

4. Improve structure where necessary.

5. Follow the original topic.

6. Follow the selected platform style.

7. Maintain the requested tone.

8. Match the target audience.

9. Apply the review suggestions.

10. Preserve factual information.

11. Do not invent statistics.

12. Do not invent companies.

13. Do not invent studies.

14. Do not invent achievements.

15. Do not invent customer results.

16. Do not make unsupported factual claims.

17. Return ONLY the improved social media post.

Do not explain the changes.
"""


            improve_response = (
                groq_client
                .chat
                .completions
                .create(

                    model=MODEL_NAME,

                    messages=[

                        {
                            "role": "system",
                            "content": (
                                "You are the Improve Agent "
                                "of an AI social media "
                                "automation system."
                            )
                        },

                        {
                            "role": "user",
                            "content": improve_prompt
                        }

                    ],

                    temperature=0.6,

                    max_tokens=600
                )
            )


            improved_content = (
                improve_response
                .choices[0]
                .message
                .content
                .strip()
            )


            if not improved_content:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Improve Agent returned "
                        "empty content."
                    )
                )


            # ---------------------------------------------
            # SAVE IMPROVED CONTENT
            # ---------------------------------------------

            post.improved_content = (
                improved_content
            )


            db.commit()

            db.refresh(post)


            improve_status = "completed"

            approval_status = "waiting"


            print(
                "Improve Agent completed."
            )

            print(
                "Improved content saved."
            )


        # =================================================
        # STEP 8 — FINAL WORKFLOW RESULT
        # =================================================

        print(
            "================================================="
        )

        print(
            "ORCHESTRATOR WORKFLOW COMPLETED:",
            post.id
        )

        print(
            "================================================="
        )


        return {

            "message":
                "Orchestrator workflow completed.",

            "post_id":
                post.id,

            "workflow": {

                "content_agent":
                    "completed",

                "review_agent":
                    "completed",

                "quality_decision": (

                    "good"

                    if (
                        review_score is not None
                        and review_score >= QUALITY_THRESHOLD
                    )

                    else "needs_improvement"

                ),

                "improve_agent":
                    improve_status,

                "approval":
                    approval_status,

                "repurpose_agent":
                    "waiting",

                "publishing_agent":
                    "waiting"

            },

            "post": {

                "id":
                    post.id,

                "content":
                    generated_content,

                "improvedContent":
                    improved_content,

                "reviewScore":
                    review_score,

                "reviewFeedback":
                    review_feedback,

                "reviewSuggestions":
                    review_suggestions,

                "status":
                    post.status,

                "approved":
                    post.approved

            }

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Orchestrator error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Orchestrator workflow failed."
            )
        )


    finally:

        db.close()

# =========================================================
# PUBLISH POST
# =========================================================

@app.post("/api/publish-post")
def publish_post(
    request: PublishPostRequest
):

    db = SessionLocal()

    try:

        print(
            "Publish request received:"
        )

        print(
            "Post ID:",
            request.post_id
        )


        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        # -------------------------------------------------
        # ALREADY PUBLISHED
        # -------------------------------------------------

        if post.status == "published":

            raise HTTPException(
                status_code=400,
                detail="Post is already published."
            )


        # -------------------------------------------------
        # ONLY APPROVED POSTS CAN BE PUBLISHED
        # -------------------------------------------------

        if not post.approved:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved posts "
                    "can be published."
                )
            )


        # -------------------------------------------------
        # SIMULATED PUBLISHING
        # -------------------------------------------------

        post.status = "published"

        post.published_at = datetime.utcnow()

        # If it was scheduled, the schedule
        # is considered completed.

        post.scheduled_at = None


        db.commit()

        db.refresh(post)


        print(
            "Post published successfully:",
            post.id
        )


        return {

            "message":
                "Post published successfully.",

            "id":
                post.id,

            "platform":
                post.platform,

            "status":
                post.status,

            "publishedAt": (

                post.published_at.isoformat()

                if post.published_at

                else None

            )

        }


    except HTTPException:

        raise


    except Exception as error:

        db.rollback()

        print(
            "Publish error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Post publishing failed."
        )


    finally:

        db.close()


# =========================================================
# REPURPOSE AGENT
# =========================================================

@app.post("/api/repurpose-post")
def repurpose_post(
    request: RepurposePostRequest
):

    db = SessionLocal()

    try:

        post = (
            db.query(PostDB)
            .filter(
                PostDB.id == request.post_id
            )
            .first()
        )


        if not post:

            raise HTTPException(
                status_code=404,
                detail="Post not found."
            )


        if not post.approved:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only approved posts "
                    "can be repurposed."
                )
            )


        # =================================================
        # USE IMPROVED CONTENT WHEN AVAILABLE
        # =================================================

        source_content = (

            post.improved_content

            if post.improved_content

            else post.content

        )


        # =================================================
        # REPURPOSE PROMPT
        # =================================================

        prompt = f"""
You are an expert social media content repurposing agent.

Repurpose the following approved social media post
for four different platforms.

ORIGINAL CONTENT
----------------

{source_content}


PLATFORM REQUIREMENTS
---------------------

LINKEDIN:
Create a professional LinkedIn post.
Use a thoughtful and informative style.

INSTAGRAM:
Create an engaging Instagram caption.
Use suitable formatting and a small number
of relevant hashtags.

X / TWITTER:
Create a concise post suitable for X/Twitter.
Keep it clear and engaging.

FACEBOOK:
Create a natural Facebook post suitable
for a general audience.


IMPORTANT
---------

- Preserve the original meaning.
- Preserve factual information.
- Do not invent statistics.
- Do not invent companies.
- Do not invent studies.
- Do not invent customer results.
- Do not invent achievements.
- Do not add unsupported factual claims.
- Do not claim that something happened
  unless it is stated in the original content.
- Adapt wording to each platform.
- Do not mention that the content was generated
  or repurposed by AI.

Return ONLY valid JSON.

Use exactly this format:

{{
    "linkedin": "LinkedIn content",
    "instagram": "Instagram content",
    "twitter": "X/Twitter content",
    "facebook": "Facebook content"
}}

Do not include markdown.
Do not include ```json.
Do not include any text outside the JSON.
"""


        completion = (
            groq_client
            .chat
            .completions
            .create(

                model=MODEL_NAME,

                messages=[

                    {
                        "role": "system",
                        "content": (
                            "You are a professional social "
                            "media content repurposing agent."
                        )
                    },

                    {
                        "role": "user",
                        "content": prompt
                    }

                ],

                temperature=0.4,

                max_tokens=1600
            )
        )


        raw_content = (
            completion
            .choices[0]
            .message
            .content
            .strip()
        )


        print(
            "AI Repurpose Response:"
        )

        print(
            raw_content
        )


        # =================================================
        # PARSE JSON
        # =================================================

        try:

            repurposed = json.loads(
                raw_content
            )

        except json.JSONDecodeError:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned invalid "
                    "repurposed JSON."
                )
            )


        linkedin = repurposed.get(
            "linkedin",
            ""
        )

        instagram = repurposed.get(
            "instagram",
            ""
        )

        twitter = repurposed.get(
            "twitter",
            ""
        )

        facebook = repurposed.get(
            "facebook",
            ""
        )


                # =================================================
        # SAVE REPURPOSED CONTENT TO DATABASE
        # =================================================

        post.repurposed_content = json.dumps(
            repurposed
        )

        db.commit()

        db.refresh(post)


        # =================================================
        # RETURN REPURPOSED CONTENT
        # =================================================

        return {

            "postId":
                post.id,

            "original":
                source_content,

            "linkedin":
                linkedin,

            "instagram":
                instagram,

            "twitter":
                twitter,

            "facebook":
                facebook,

            "saved":
                True

        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "Repurpose error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "AI content repurposing failed."
            )
        )


    finally:

        db.close()


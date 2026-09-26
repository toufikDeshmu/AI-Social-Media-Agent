from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime
)

from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime


# =====================================================
# DATABASE CONFIGURATION
# =====================================================

DATABASE_URL = "sqlite:///./social_media_agent.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# =====================================================
# POST TABLE
# =====================================================

class PostDB(Base):

    __tablename__ = "posts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    platform = Column(
        String(50),
        nullable=True
    )

    topic = Column(
        String(255),
        nullable=True
    )

    content_type = Column(
        String(100),
        nullable=True
    )

    tone = Column(
        String(100),
        nullable=True
    )

    audience = Column(
        String(255),
        nullable=True
    )

    instructions = Column(
        Text,
        nullable=True
    )

    content = Column(
        Text,
        nullable=False
    )

    # =================================================
    # REVIEW INFORMATION
    # =================================================

    review_score = Column(
        Integer,
        nullable=True
    )

    review_feedback = Column(
        Text,
        nullable=True
    )

    review_suggestions = Column(
        Text,
        nullable=True
    )

    # =================================================
    # IMPROVED CONTENT
    # =================================================

    improved_content = Column(
        Text,
        nullable=True
    )

    # =================================================
    # REPURPOSED CONTENT
    # =================================================

    repurposed_content = Column(
    Text,
    nullable=True
   )

    # =================================================
    # APPROVAL
    # =================================================

    approved = Column(
        Boolean,
        default=False
    )

    # =================================================
    # SCHEDULING
    # =================================================

    scheduled_at = Column(
        DateTime,
        nullable=True
    )

    # =================================================
    # PUBLISHING
    # =================================================

    published_at = Column(
        DateTime,
        nullable=True
    )

    # =================================================
    # STATUS
    # =================================================

    status = Column(
        String(50),
        default="draft"
    )

    # =================================================
    # CREATION TIME
    # =================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# =====================================================
# INITIALIZE DATABASE
# =====================================================

def init_db():

    Base.metadata.create_all(
        bind=engine
    )
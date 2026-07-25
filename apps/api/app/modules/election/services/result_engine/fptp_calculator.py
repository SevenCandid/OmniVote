from typing import List
from collections import defaultdict

from .base_calculator import BaseCalculator, CandidateResultDTO, CategoryResultDTO

class FPTPCalculator(BaseCalculator):
    """
    First Past The Post (and Multiple Winner) Calculator.
    Counts the total votes per candidate and ranks them.
    Ties are detected and marked.
    The top N candidates (up to max_winners) are marked as winners.
    """
    def calculate(self, category, candidates: List, selections: List) -> CategoryResultDTO:
        # 1. Count votes (summing vote_weight)
        vote_counts = defaultdict(int)
        for sel in selections:
            if sel.candidate_id:
                # Use vote_weight if present, otherwise default to 1 for backwards compatibility or tests
                weight = getattr(sel, 'vote_weight', 1)
                vote_counts[sel.candidate_id] += weight
                
        # Calculate total votes in this category
        total_category_votes = sum(vote_counts.values())

        # 2. Build candidate data
        candidate_data = []
        for cand in candidates:
            votes = vote_counts.get(cand.id, 0)
            percentage = (votes / total_category_votes * 100) if total_category_votes > 0 else 0.0
            candidate_data.append({
                "candidate": cand,
                "vote_count": votes,
                "percentage": round(percentage, 2)
            })

        # 3. Sort by votes descending
        candidate_data.sort(key=lambda x: x["vote_count"], reverse=True)

        # 4. Rank and identify ties
        current_rank = 1
        current_votes = -1
        tied_votes = set()
        
        # First pass to find which vote counts are tied
        vote_freq = defaultdict(int)
        for cd in candidate_data:
            vote_freq[cd["vote_count"]] += 1
            
        for count, freq in vote_freq.items():
            if freq > 1:
                tied_votes.add(count)

        # Second pass to assign ranks and winners
        results = []
        for i, cd in enumerate(candidate_data):
            if cd["vote_count"] < current_votes:
                current_rank = i + 1
            
            current_votes = cd["vote_count"]
            
            is_tied = current_votes in tied_votes
            # A candidate is a winner if their rank is <= max_winners.
            # However, if there's a tie at the cutoff, all tied candidates at that rank might technically overlap the max_winner boundary.
            # We strictly assign winner if rank <= max_winners
            is_winner = current_rank <= category.max_winners
            
            results.append(
                CandidateResultDTO(
                    candidate_id=cd["candidate"].id,
                    name=cd["candidate"].full_name,
                    photo=cd["candidate"].photo,
                    vote_count=cd["vote_count"],
                    percentage=cd["percentage"],
                    rank=current_rank,
                    is_winner=is_winner,
                    is_tied=is_tied
                )
            )

        return CategoryResultDTO(
            category_id=category.id,
            name=category.name,
            total_votes=total_category_votes,
            candidates=results
        )

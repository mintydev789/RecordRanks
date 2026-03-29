with stats as (
  select
    events.name,
    (
      select count(distinct contests.competition_id) from record_ranks.rounds
      inner join record_ranks.contests
        on contests.competition_id = rounds.competition_id
      where event_id = events.event_id
        and (contests.state = 'finished' or contests.state = 'published')
    ) as times_held,
    (
      select count(distinct contests.competition_id) from record_ranks.rounds
      inner join record_ranks.contests
        on contests.competition_id = rounds.competition_id
      where event_id = events.event_id
        and contests.type = 'wca-comp'
        and (contests.state = 'finished' or contests.state = 'published')
    ) as times_held_wca,
    (
      select count(distinct contests.competition_id) from record_ranks.rounds
      inner join record_ranks.contests
        on contests.competition_id = rounds.competition_id
      where event_id = events.event_id
        and contests.type = 'comp'
        and (contests.state = 'finished' or contests.state = 'published')
    ) as times_held_competitions,
    (
      select count(distinct contests.competition_id) from record_ranks.rounds
      inner join record_ranks.contests
        on contests.competition_id = rounds.competition_id
      where event_id = events.event_id
        and contests.type = 'meetup'
        and (contests.state = 'finished' or contests.state = 'published')
    ) as times_held_meetups
  from record_ranks.events
)
select * from stats
where times_held > 0
order by times_held desc
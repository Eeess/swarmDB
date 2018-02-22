#ifndef BLUZELLE_RAFTCANDIDATESTATE_H
#define BLUZELLE_RAFTCANDIDATESTATE_H

#include "RaftState.h"

#include <random>
#include <boost/asio/deadline_timer.hpp>

class RaftCandidateState : public RaftState {
private:
    std::random_device rd_;

    boost::asio::deadline_timer election_timeout_timer_;

    void schedule_election();

    void start_election(const boost::system::error_code& e);

    void finish_election();

    bool nominated_for_leader_;

    uint16_t voted_yes_;

    uint16_t voted_no_;

public:
    RaftCandidateState(boost::asio::io_service& ios,
                       Storage& s,
                       CommandFactory& cf,
                       ApiCommandQueue& pq,
                       PeerList& ps,
                       std::function<std::string(const std::string&)> rh,
                       std::unique_ptr<RaftState>& ns);

    ~RaftCandidateState();

    bool
    nominated_self()
    {
        return nominated_for_leader_;
    }

    void
    count_vote(bool vote_yes);

    virtual
    std::unique_ptr<RaftState>
    handle_request(
        const std::string& request,
        std::string& response) override;

    virtual
    RaftStateType get_type() const override
    {
        return RaftStateType::Candidate;
    }


    void
    cancel_election();
};

#endif //BLUZELLE_RAFTCANDIDATESTATE_H
